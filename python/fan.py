#!/usr/bin/python

import os
from time import sleep
import signal
import sys
import RPi.GPIO as GPIO


pin = 18 # The pin ID, edit here to change it
maxTMP = 45 # The maximum temperature in Celsius after which we trigger the fan
minTmp = 41

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(pin, GPIO.OUT)
    GPIO.setwarnings(False)
    return()

def getCPUtemperature():
    res = os.popen('vcgencmd measure_temp').readline()
    temp =(res.replace('temp=','').replace('C\n',''))
    temp = temp.replace("'",'') 
    print('temp is {0}'.format(temp)) #Uncomment here for testing
    return temp

def fanON():
    setPin(True)
    return()

def fanOFF():
    setPin(False)
    return()

def getTEMP():
    CPU_temp = float(getCPUtemperature())
    if CPU_temp > maxTMP:
        fanON()
    elif CPU_temp <= minTmp:
        fanOFF()
    return()

def setPin(mode):
    GPIO.output(pin, mode)
    return()

if __name__ == '__main__':
    try:
        setup() 
        while True:
            getTEMP()
            sleep(5) # Read the temperature every 5 sec, increase or decrease this limit if you want
    except KeyboardInterrupt: # trap a CTRL+C keyboard interrupt 
        GPIO.cleanup() # resets all GPIO ports used by this program
