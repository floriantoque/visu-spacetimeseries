#!/usr/bin/env python
# coding: utf-8

import sys 
sys.path.insert(0, '../')
import utils

from tqdm import tqdm
import pandas as pd
from datetime import datetime as dtlib
import os
import yaml
import argparse
from yaml import load, dump
try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper

# Read config file and load config variables
parser = argparse.ArgumentParser(description='Parameters of script create _dates_residues.py')
parser.add_argument('--config', type=str, help='Yaml file containing the configuration')

args = parser.parse_args()
config_file = args.config

with open(config_file, 'r') as stream:
    try:
        config = yaml.load(stream, Loader=Loader)
    except yaml.YAMLError as exc:
        print(exc)


obs_path = config['obs_path']
preds_path = config['preds_path'] 
models_name = config['models_name']

index_ = config['index_']

json_path = config['json_path']
csv_path = config['csv_path']


# Read files
obs = pd.read_csv(obs_path)
preds = [pd.read_csv(i) for i in preds_path]

if not os.path.exists(json_path):
    os.makedirs(json_path)
    if not os.path.exists(csv_path):
        os.makedirs(csv_path)

# Dates
dates = {}
dates['year'] = {}
dates['year_list'] = sorted(list(set([i[:4] for i in obs[index_].values])))
dates['timestep_list'] = sorted(list(set([i[11:] for i in obs[index_].values])))
data = [[i[:4],i[5:10]] for i in sorted(list(set([j[:10] for j in obs[index_].values])))]
days = pd.DataFrame(data = data, columns = ['year', 'day']).set_index('year')

for i in dates['year_list']:
    dates['year'][i] = {}
    dates['year'][i]['mm'] = [i[:2] for i in days.loc[i].values.flatten().tolist()]
    dates['year'][i]['month_en'] = [dtlib.strptime(i+'-'+d,'%Y-%m-%d').strftime("%B") for d in days.loc[i].values.flatten().tolist()]
    dates['year'][i]['mm-dd'] = days.loc[i].values.flatten().tolist()
    dates['year'][i]['weekday_en'] = [dtlib.strptime(i+'-'+d,'%Y-%m-%d').strftime("%A") for d in days.loc[i].values.flatten().tolist()]

# Create Observation\_data
observation_data = {}
for y in dates['year_list']:
    observation_data[y] = obs.set_index(index_).loc[y:str(int(y)+1)].reset_index()

# Save Observation\_data
for y in tqdm(dates['year_list']):
    for md in dates['year'][y]['mm-dd']:
        m = md[:2]
        d = md[3:]
        path = '{}observation/{}/{}/{}/'.format(csv_path, y, m, d)
        if not os.path.exists(path):
            os.makedirs(path)
        path_file = '{}observation.csv'.format(path)
        df = observation_data[y].copy()
        stop_id = df.set_index(index_).columns.values.tolist()
        df['ymd'] = [i[:10] for i in df.set_index(index_).index.values]
        df[index_] = [i[11:] for i in df.set_index(index_).index.values]
        df = df.set_index('ymd').loc['{}-{}'.format(y,md)]
        df = df.reset_index()[[index_]+stop_id]
        utils.stack_df(df).to_csv(path_file, index=False)

# Create Prediction\_data
prediction_data = {}
for y in dates['year_list']:
    prediction_data[y] = {}
    for p, mn in zip(preds, models_name):
        prediction_data[y]['preds_'+mn] = p.set_index(index_).loc[y:str(int(y)+1)].reset_index()

# Save Prediction\_data
for y in tqdm(dates['year_list']):
    for md in dates['year'][y]['mm-dd']:
        m = md[:2]
        d = md[3:]
        for mn in models_name:
            path = '{}preds/{}/{}/{}/'.format(csv_path, y, m, d)
            if not os.path.exists(path):
                os.makedirs(path)
            path_file = '{}{}.csv'.format(path, 'preds_'+mn)
            df = prediction_data[y]['preds_'+mn].copy()
            stop_id = df.set_index(index_).columns.values.tolist()
            df['ymd'] = [i[:10] for i in df.set_index(index_).index.values]
            df[index_] = [i[11:] for i in df.set_index(index_).index.values]
            df = df.set_index('ymd').loc['{}-{}'.format(y,md)]
            df = df.reset_index()[[index_]+stop_id]
            utils.stack_df(df).to_csv(path_file, index=False)
