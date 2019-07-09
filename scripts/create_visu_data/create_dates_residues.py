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

try:
    agg_function = [eval(i) for i in config['agg_function']]
except:
    agg_function = config['agg_function']
agg_function_name = config['agg_function_name']

norm_function = config['norm_function'] 
try:
    norm_function = [eval(i) for i in config['norm_function']]
except:
    norm_function = config['norm_function']
norm_function_name = config['norm_function_name'] 

try:
    norm_year_function = [eval(i) for i in config['norm_year_function']]
except:
    norm_year_function = config['norm_year_function']
norm_year_function_name = config['norm_year_function_name'] 

index_ = config['index_']

json_path = config['json_path']
csv_path = config['csv_path']


# Read files
obs = pd.read_csv(obs_path)
preds = [pd.read_csv(i) for i in preds_path]

# Create directories
if not os.path.exists(json_path):
    os.makedirs(json_path)
if not os.path.exists(csv_path):
    os.makedirs(csv_path)

# Create Dates
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

# Save Dates
with open(json_path+'dates.json', "w") as text_file:
    text_file.write("const dates = {};".format(dates))

# Create Residues
## residues[year][pred_name][norm]
residues = {}
for y in dates['year_list']:
    residues[y] = {}
    for p, mn in zip(preds, models_name):
        residues[y]['residues_'+mn] = {}
        residues[y]['residues_'+mn]['no_norm'] = (obs.set_index(index_).loc[y:str(int(y)+1)] -
                                      p.set_index(index_).loc[y:str(int(y)+1)]).reset_index(index_) 
        
## normalize residues
for y in tqdm(dates['year_list'], desc='(1/5)Normalize residues'):
    for p, mn in zip(preds, models_name):
        for nf, nfn in zip(norm_function, norm_function_name):
            residues[y]['residues_'+mn][nfn] = nf(residues[y]['residues_'+mn]['no_norm'])


# Save Residues
for y in tqdm(dates['year_list'], desc='(2/5)Save residues'):
    for md in dates['year'][y]['mm-dd']:
        m = md[:2]
        d = md[3:]
        for mn in models_name:
            for nfn in norm_function_name+['no_norm']:
                path = '{}residues/{}/{}/{}/'.format(csv_path, y, m, d)
                if not os.path.exists(path):
                    os.makedirs(path)
                path_file = '{}{}__{}.csv'.format(path, 'residues_'+mn, nfn)
                df = residues[y]['residues_'+mn][nfn].copy()
                stop_id = df.set_index(index_).columns.values.tolist()
                df['ymd'] = [i[:10] for i in df.set_index(index_).index.values]
                df[index_] = [i[11:] for i in df.set_index(index_).index.values]
                df = df.set_index('ymd').loc['{}-{}'.format(y,md)]
                df = df.reset_index()[[index_]+stop_id]
                utils.stack_df(df).to_csv(path_file, index=False)

# Create Residues aggregated for year visualization
## residues_aggyear[year][pred_name][agg_function_name][norm]
residues_aggyear = {}

for y in tqdm(dates['year_list'], desc = '(3/5)Residues visu year'):
    residues_aggyear[y] = {}
    for p, mn in zip(preds, models_name):
        residues_aggyear[y]['residues_'+mn]={}
        for agg_f, agg_f_n in zip(agg_function, agg_function_name):
            residues_aggyear[y]['residues_'+mn][agg_f_n] = {}
            residues_aggyear[y]['residues_'+mn][agg_f_n]['no_norm'] = utils.agg_year_df(residues[y]['residues_'+mn]['no_norm'], agg_f)

## normalize residues_aggyear
for y in tqdm(dates['year_list'], desc='(4/5)Normalize residues visu year'):
    for p, mn in zip(preds, models_name):
        for agg_f, agg_f_n in zip(agg_function, agg_function_name):
            for nyf, nyfn in zip(norm_year_function, norm_year_function_name): 
                residues_aggyear[y]['residues_'+mn][agg_f_n][nyfn] = nyf(residues_aggyear[y]['residues_'+mn][agg_f_n]['no_norm'])

# Save residues aggregated for year visualization 
for y in tqdm(dates['year_list'], desc='(5/5)Save residues visu year'):
    for mn in models_name:
        for agg_f_n in agg_function_name:
            for nyfn in norm_year_function_name+['no_norm']: 
                path = '{}residues_visuyear/{}/'.format(csv_path, y)
                if not os.path.exists(path):
                    os.makedirs(path)
                path_file = '{}{}__{}__{}.csv'.format(path, 'residues_'+mn, agg_f_n, nyfn)
                df = utils.stack_df(residues_aggyear[y]['residues_'+mn][agg_f_n][nyfn])
                df.to_csv(path_file, index=False)
