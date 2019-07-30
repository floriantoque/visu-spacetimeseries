const modelsName = ['rf1', 'rf2', 'rf4'];
const modelsNameTooltip =  `<b>rf1:</b>Random Forest model with simple features (day and month) as input of the model 
														<br><b>rf2:</b>Random Forest model with calendar features as input of the model
														<br><b>rf4:</b>Random Forest model with calendar features and event as input of the model`;
//const aggFunctionName = ['agg_maxabs_sign_at_1','agg_max', 'agg_min',  'agg_maxabs_sign_at_4'];
const aggFunctionName = ['agg_maxabs_sign_at_1']
const aggFunctionNameTooltip = `<b>agg_maxabs_sign_at_1: </b>Select the maximum value (negative or positive) per day`
const normFunctionName =  ['norm_allstop_perday', 'norm_perstop_perday', 'norm_allstop_allperiod', 
	'norm_perstop_allperiod'];
const normFunctionNameTooltip = `<b>norm_allstop_perday: </b>Per year, normalize per the maximum value of all stop per day (Year column normalization)
																		 <br><b>norm_perstop_perday: </b>Per year, normalize per the maximum value per stop per day (Year row normalization)
																		 <br><b>norm_allstop_allperiod: </b>Per year, normalize per the maximum value of all stop and all the timebin (Day normalization)
																		 <br><b>norm_perstop_allperiod: </b>Per year, normalize per the maximum value per stop and all the timebin (Day row normalization)`
const normYearFunctionName = ['norm_allstop_perday', 'norm_perstop_allday','norm_allstop_allday'];
const normYearFunctionNameTooltip = `<b>norm_allstop_perday: </b>Per year, normalize per the maximum value of all stop per day (Column normalization)
																		 <br><b>norm_perstop_allday: </b>Per year, normalize per the maximum value of all day per stop (Row normalization)
																		 <br><b>norm_allstop_allday: </b>Per year, normalize per the maximum value of all stop and all day (Year normalization)`
const jsonPath = 'data/json/';
const csvPath = 'data/csv/';

const fileStop = "stop_info.csv";
const fileEvents = ["events.json", "incidents.json"];
const fileEventsName = ["Event", "Incident"]
let dataEvents = [];

let currYear = dates["year_list"][0];
let currMonth = dates["year"][currYear]["mm"][0];
let currYmd = currYear + "-" + dates["year"][currYear]["mm-dd"][0];
let currDay = currYmd.substring(8, currYmd.length);
let currMonthEn = dates["year"][currYear]["month_en"][0]; 
let currDayEn = dates["year"][currYear]["weekday_en"][0]; 

const predsName = modelsName.map(x=>'preds_'+x);
const residuesName = modelsName.map(x=>'residues_'+x);

let currResidues = residuesName[0];

