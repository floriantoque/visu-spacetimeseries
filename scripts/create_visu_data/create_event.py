#!/usr/bin/env python
# coding: utf-8
import pandas as pd
from tqdm import tqdm

import json

import argparse
import yaml
from yaml import load, dump
try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper

# Read config file and load config variables
parser = argparse.ArgumentParser(description='Parameters of script create_event_incident.py')
parser.add_argument('--config', type=str, help='Yaml file containing the configuration')

args = parser.parse_args()
config_file = args.config

with open(config_file, 'r') as stream:
    try:
        config = yaml.load(stream, Loader=Loader)
    except yaml.YAMLError as exc:
        print(exc)


events_path = config['events_path']
events_name = config['events_name']

json_path = config['json_path']



for ep, file_name in tqdm(zip(events_path, events_name),
                          total=len(events_path)):

    events = pd.read_csv(ep).fillna('null')
    d = {}

    #list event per timestep
    df_ = events.set_index(['stop_id', 'start_datetime']).copy()
    for si, sd in df_.reset_index().drop_duplicates(['stop_id', 'start_datetime'])[['stop_id', 'start_datetime']].values:
        try:
            d[str(si)][sd]['list_event'] = df_.loc[si].loc[[sd]].to_dict(orient='records')
        except:
            try:
                d[str(si)][sd] = {}
                d[str(si)][sd]['list_event'] = df_.loc[si].loc[[sd]].to_dict(orient='records')
            except:
                d[str(si)] = {}
                d[str(si)][sd] = {}
                d[str(si)][sd]['list_event'] = df_.loc[si].loc[[sd]].to_dict(orient='records')
                
    # list event per day
    df_ = events.copy()
    df_['datetime'] = [i[:10] for i in df_['start_datetime'].values]
    df_ = df_.set_index(['stop_id', 'datetime'])
    for si, sd in df_.reset_index().drop_duplicates(['stop_id','datetime'])[['stop_id', 'datetime']].values:

        try:
            d[str(si)][sd]['list_event'] = df_.loc[si].loc[[sd]].to_dict(orient='records')
        except:
            try:
                d[str(si)][sd] = {}
                d[str(si)][sd]['list_event'] = df_.loc[si].loc[[sd]].to_dict(orient='records')
            except:
                d[str(si)] = {}
                d[str(si)][sd] = {}
                d[str(si)][sd]['list_event'] = df_.loc[si].loc[[sd]].to_dict(orient='records')

    #Save
    with open(json_path+file_name+'.json', 'w') as fp:
        json.dump(d, fp)
