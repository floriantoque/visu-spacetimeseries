help:
	@cat Makefile

IMAGE?="my_visu_image"
PYTHON_VERSION?=3.7
ENV_NAME?="mypython"
ENV_DISP_NAME?="Python 3.7 - env"
USERNAME?=toque
DOCKER_FILE?=Dockerfile
DOCKER?=docker
SRC?=$(shell dirname `pwd`)
DASHBOARDS_DATA?="/HDD250/workclean/data/visu-sts-dashboards-data/"
DATA?="/HDD250/workclean/data/visu-spacetimeseries/"
CONTAINER?="my_visu_container"
#TEST?=tests/

build:
	docker build -t $(IMAGE) --build-arg python_version=$(PYTHON_VERSION) --build-arg env_name=$(ENV_NAME) --build-arg env_disp_name=$(ENV_DISP_NAME) --build-arg username=$(USERNAME) -f $(DOCKER_FILE) .

bash: build
	$(DOCKER) run -it -v $(SRC):/home/$(USERNAME)/visu-spacetimeseries/ -v $(DATA):/home/$(USERNAME)/visu-spacetimeseries/data/ -v $(DASHBOARDS_DATA):/home/$(USERNAME)/visu-spacetimeseries/dashboards/data/ --net=host --name $(CONTAINER) $(IMAGE)
