# Using Python with selected libraries via docker

This directory contains `Dockerfile` to make it easy to get up and running with Python environments via [Docker](http://www.docker.com/).  

With this dockerfile it is possible to create a Python 3.7 environment and install different libraries.   

Available shell/process/editor:
 * zsh
 * htop
 * vim

## Workflow

i) run the container  

    $ make bash  

ii) activate Python environment  

    $ source activate mypython 

iib) run ipython notebook and access it in from a remote computer  
Computer with docker:  

    $ jupyter notebook --no-browser --port=8887   

Local computer:

    $ ssh -N -f -L localhost:8885:127.0.0.1:8887 user@ip_computer_docker  
    
Local computer: access to the notebook in the browser at localhost:8885  


## Installing Docker

General installation instructions are
[on the Docker site](https://docs.docker.com/installation/), but we give some
quick links here:

* [OSX](https://docs.docker.com/installation/mac/): [docker toolbox](https://www.docker.com/toolbox)
* [ubuntu](https://docs.docker.com/installation/ubuntulinux/)

 

## Running the container

We are using `Makefile` to simplify docker commands within make commands.

Build the container and access to the bash

    $ make bash


Mount a volume for external data sets

    $ make DATA=~/mydata

You can change zsh parameters by editing `/docker/.zshrc`.  
You can change vim parameters by editing `/docker/.vimrc`.  

