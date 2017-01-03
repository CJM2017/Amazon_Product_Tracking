#!/Users/connormccann/anaconda/bin/python3.5
"""
    Program     : Amazon Scrapper
    Author      : Connor McCann
    Date        : 15 Dec. 2016

    Purpose - 

        To scrape the amazon market place looking for items which are
        considered to be on sale and then make approved purchases to be
        sent to a predetermined location. Libraries included in Anaconda.

    Installs:
        
        * using latest anaconda dependencies
        * pip install pymysql
"""
import os
import re
import csv
import json
import requests
from lxml import html  
from time import clock as clk
from time import sleep
import datetime as dt
import pymysql
pymysql.install_as_MySQLdb()
import MySQLdb


def makeDatabase(db_data):
    db = MySQLdb.connect(host = db_data["host"], port = db_data["port"], user = db_data["user"], passwd = db_data["pwd"],db = db_data["db"]) 
    cursor = db.cursor()
    sqlcmd = """CREATE TABLE IF NOT EXISTS Products(ID int NOT NULL AUTO_INCREMENT,Primary KEY (ID), Code varchar(50), Name varchar(50), Original_Price float(2), Sale_Price float(2), Availability int, InsertionTime varchar(50))"""
    try:
        cursor.execute(sqlcmd)
        db.commit()
    except:
        print('Error with SQL Insertion')
        db.rollback()
    db.close()


def buildCommand(data):
    cmd = "INSERT INTO Products(Code, Name, Original_Price, Sale_Price, Availability, InsertionTime) VALUES"
    for key in data:
        # convert the price to a type float to check if it is in fact a viable number
        # be careful of $ and ,
        if (key.__eq__('ORIGINAL_PRICE') or key.__eq__('SALE_PRICE')):
            try:
                data[key] = data[key].replace('$','')
                data[key] = data[key].replace(',','')
                data[key] = float(data[key])
                data[key] = str(data[key])
            except:
                data[key] = '0.00'
                print("error with float()")

        # look for the number of available products in the string 
        elif (key.__eq__('AVAILABILITY')):
            data[key] = re.findall(r'\b\d+\b',data[key])
            if (len(data[key]) is 0):
                data[key] = '20' # enough not to include a value
            else:
                data[key] = data[key][0] # the first number it might come accross (not always working)

        # remove " in strings which cause SQl insertion errors
        elif (key.__eq__('NAME')):
            data[key] = data[key].replace('"',' ')

    vals = "(",'"'+data['CODE']+'"'+",",'"'+data['NAME']+'"'+",",data['ORIGINAL_PRICE']+",",data['SALE_PRICE']+",",data['AVAILABILITY']+",","'"+data['Today']+"'"+")"
    cmd += "".join(vals)
    return cmd


def insertMySQL(db_data, sqlcmd):
    db = MySQLdb.connect(host = db_data["host"], port = db_data["port"], user = db_data["user"], passwd = db_data["pwd"],db = db_data["db"]) 
    cursor = db.cursor()
    try:
        cursor.execute(sqlcmd)
        db.commit()
    except Exception as e:
        print('Error with SQL Insertion')
        print(e)
        db.rollback()
    db.close()

def getAsins(db_data):
    db = MySQLdb.connect(host = db_data["host"], port = db_data["port"], user = db_data["user"], passwd = db_data["pwd"],db = db_data["db"]) 
    cursor = db.cursor()
    sqlcmd = 'SELECT * FROM ASIN;'
    try:
        cursor.execute(sqlcmd)
        results = cursor.fetchall()
        AsinList = []
        Asin = 1
        Price_Point = 2
        Text_Response = 3

        for row in results:
            AsinList.append(str(row[Asin]))
        return AsinList

    except Exception as e:
        print('Error with SQL Query')
        print(e)
        return AsinList
    db.close()


def sendText(phone):
    pass


def AmzonParser(url,ASIN):
    headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0'}
    page = requests.get(url,headers=headers)

    while True:
        sleep(3) # not sure why this is necesssary atm
        try:
            # set variables for what data we want to look for on the page
            doc = html.fromstring(page.content)
            XPATH_NAME = '//h1[@id="title"]//text()'
            XPATH_SALE_PRICE = '//span[contains(@id,"ourprice") or contains(@id,"saleprice")]/text()'
            XPATH_ORIGINAL_PRICE = '//td[contains(text(),"List Price") or contains(text(),"M.R.P") or contains(text(),"Price")]/following-sibling::td/text()'
            XPATH_CATEGORY = '//a[@class="a-link-normal a-color-tertiary"]//text()'
            XPATH_AVAILABILITY = '//div[@id="availability"]//text()'

            # find the text contained on the variables paths
            RAW_NAME = doc.xpath(XPATH_NAME)
            RAW_SALE_PRICE = doc.xpath(XPATH_SALE_PRICE)
            RAW_CATEGORY = doc.xpath(XPATH_CATEGORY)
            RAW_ORIGINAL_PRICE = doc.xpath(XPATH_ORIGINAL_PRICE)
            RAw_AVAILABILITY = doc.xpath(XPATH_AVAILABILITY)

            # re-format to something we can use and interpret *** need further information ***
            NAME = ' '.join(''.join(RAW_NAME).split()) if RAW_NAME else None
            SALE_PRICE = ' '.join(''.join(RAW_SALE_PRICE).split()).strip() if RAW_SALE_PRICE else None
            CATEGORY = ' > '.join([i.strip() for i in RAW_CATEGORY]) if RAW_CATEGORY else None
            ORIGINAL_PRICE = ''.join(RAW_ORIGINAL_PRICE).strip() if RAW_ORIGINAL_PRICE else None
            AVAILABILITY = ''.join(RAw_AVAILABILITY).strip() if RAw_AVAILABILITY else None

            # deal with empty values of the above data
            if ORIGINAL_PRICE is None or ORIGINAL_PRICE is "":
                print("trying the span for the price")
                XPATH_ORIGINAL_PRICE = '//span[contains(@id,"priceblock_ourprice")]//text()'
                RAW_ORIGINAL_PRICE = doc.xpath(XPATH_ORIGINAL_PRICE)
                ORIGINAL_PRICE = ''.join(RAW_ORIGINAL_PRICE).strip() if RAW_ORIGINAL_PRICE else None
                print(str(ORIGINAL_PRICE))

            # set the original price to the sale price if it is empty
            # not ORIGINAL_PRICE:
                #ORIGINAL_PRICE = SALE_PRICE

            if page.status_code!=200:
                raise ValueError('captha')

            # store the data in a dictionary (key-value-pair)
            data = {
                    'NAME':NAME,
                    'CODE': ASIN,
                    'SALE_PRICE':SALE_PRICE,
                    'CATEGORY':CATEGORY,
                    'ORIGINAL_PRICE':ORIGINAL_PRICE,
                    'AVAILABILITY':AVAILABILITY,
                    'URL':url,
                    'Today':str(dt.datetime.today())
                    }

            return data
        except Exception as e:
            print (e) # used for debugging problems


def ReadAsin(db_data, saveJson):
    AsinList = getAsins(db_data)
    extracted_data = []

    for ASIN in AsinList:
        url = "http://www.amazon.com/dp/"+ASIN
        print ("Processing: "+url)
        extracted_data.append(AmzonParser(url,ASIN))
        sleep(5)

    if (saveJson):
        f=open('web_data.json','w')
        json.dump(extracted_data,f,indent=4)

    else:
        for prod in extracted_data:
            sqlcmd = buildCommand(prod)
            insertMySQL(db_data, sqlcmd)

def configDatabase():
    with open('../../mysql_config.json') as json_data:
        db_data = json.load(json_data);
    return db_data


if __name__ == "__main__":
    
    saveJson = False
    delay = 300    # seconds -> 5 minutes
    config = configDatabase()
    makeDatabase(config)

    while(True):
        start = clk()
        ReadAsin(config, saveJson)
        elapsed = clk()-start
        previousRemaining = 0

        while(elapsed < delay):
            elapsed = clk()-start
            remaining = int((delay-elapsed)/60)

            if(abs(remaining-previousRemaining) >= 1):
                ouput = "The program will run again in {0} minutes".format(remaining)
                print(ouput)
                previousRemaining = remaining




