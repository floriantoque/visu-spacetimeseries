# Visualization tools for space-time series forecasting analysis with context awareness
This project aims to help people who forecast space-time series to analyze the forecasting residues. First it provides python scripts to manage generic space-time series data and event data. Secondly it provides two analyzing tools (time and space oriented) that helps to visualize space-time series with scaled data.

The time visualization is a heatmap that helps to analyze day aggregated residues over years and to zoom into day visualization.

The space visualization allows to project in a map the different residues and to see the spatial correlation between forecasting residues.


## What do you need:
 * docker

## How to use the scripts to format data and use them in the visualization:

* Go to docker folder
* Run the container: `make bash`
* Activate python 3: `source activate mypython`
* Go to /visu-spacetimeseries/scripts/create\_visu\_data/ folder
* Change config.yaml file as you want
* Create dates and residues files with: `python create_dates_residues.py --config config.yaml`
* Create event files with: `python create_event.py --config config.yaml`

### What does correspond config.yaml file variables:
* obs\_path: path of the observation csv file   
* preds\_path: list of path of the forecasting csv files
* preds\_name: list of name of the forecasting to show in visualization
* agg\_function: list of function used to aggregate residues values in time visualization with year view. A set of function are defined in python script utils.
* agg\_function\_name: list of name of the aggregation function to show in visualization.
* norm\_function: list of function used to normalize residues values for visualization with day view. A set of function are defined in python script utils.
* norm\_function\_name: list of name of the normalization function to show in visualization with day view.
* norm\_year\_function: list of function used to normalize residues values for visualization with year view. A set of function are defined in python script utils.
* norm\_year\_function\_name: list of name of the normalization function to show in visualization with year view.
* index_: string, index name of obs and preds csv files
* json\_path: folder path used to save json files created with python script
* csv\_path: folder path used to save csv files created with python script
* events\_path: list of event csv files. Columns need to contains: start\_datetime (start datetime of the event with format yyyy-mm-dd HH:MM:SS) and stop\_id that correspond to stop\_id of obs and preds files.  
* events\_name: list of name of events files used to save json files used by visualizations

Obs and preds csv files correspond to this format
| index\_             | stop\_id1 | stop\_id2 |..
|---------------------|-----|-----|--
| 2015-01-01 00:00:00 | v11 | v12 |..
| 2015-01-01 00:15:00 | v21 | v22 |..
|..|..|..|..


Event csv files correspond to this format
| start\_datetime            | stop\_id | .. 
|---------------------|-----|-----|--
| 2015-01-01 00:00:00 | stop\_idn | .. 
| 2015-01-01 00:15:00 | stop\_idn| .. 
|..|..|..
