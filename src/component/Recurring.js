import React,{ Component } from 'react';
import $ from 'jquery';
import { Form,Button } from 'react-bootstrap';
import moment from 'moment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, DatePicker, LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';

class Recurring extends Component {
	constructor(props) {
        super(props);
	 	this.state ={
			startDate:'',
			oldStartDate:new Date().toLocaleString("en-US", {timeZone: "America/New_York"}).replace(',',''),
			repeatAfter:1,
			repeatOn:false,
			repeatOnMonths:false,
			onDayName:'',
			onDayNum:'',
			weekNumber:'',
		}
		
		this.handleChange = this.handleChange.bind(this);
    }
	
	componentDidMount() {
		
	}
	
	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;

		this.setState({[event.target.name]:event.target.value});
		
		if(name == 'recurring' && res == 'No'){
			this.setState({repeatOn:false,repeatOnMonths:false});
		}
		
		if(name == 'repeatEvery' && res == 'weeks'){
			this.setState({repeatOn:true});
		}else if(name == 'repeatEvery' && res != 'weeks'){
			this.setState({repeatOn:false});
		}
		
		if(name == 'repeatEvery' && res == 'months'){
			let startDate = this.state.startDate;
			
			if(!startDate){
				startDate = moment(this.props.defaultProps.startDate).format('MM/DD/YYYY');
				this.setState({startDate});
			}
			
			/* let onDayNum = moment(startDate).format('DD');
			let onDayName = moment(startDate).format('dddd');
			let weekNumber = Math.ceil(parseInt(onDayNum, 10) / 7);
			this.setState({repeatOnMonths:true,onDayNum,onDayName,weekNumber}); */
			
			this.setState({repeatOnMonths:true});

		}else if(name == 'repeatEvery' && res != 'months'){
			this.setState({repeatOnMonths:false});
		}
		this.props.getValue(event);
	}
	
	handleChange = date => {
        //let newDate = (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
        this.setState({
          startDate: date,date
        }); 
		this.props.setStartDate(date);
		this.setState({repeatOnMonths:false});
    };
	
	render(){
		const {recurring,repeatOn,repeatOnMonths} = this.state;
		const {defaultProps} = this.props;
		
		/* let onDayNum = this.state.onDayNum;
		let onDayName = this.state.onDayName;
		let weekNumber = this.state.weekNumber;
		
		if(defaultProps.repeatEvery == 'months'){
			let str = defaultProps.repeatOnDay;
			console.log('str->',str);
			if(str.indexOf('|') > -1){
				let ret = str.split("|");
				console.log('ret->',ret);
				weekNumber = ret[0];
				onDayName = ret[1];
			}else if(onDayNum == ''){
				onDayNum = defaultProps.repeatOnDay;
			}
		} */
		
		/* let weekNumberText = 'first';
		if(weekNumber == 2){
			weekNumberText = 'second';
		}else if(weekNumber == 3){
			weekNumberText = 'third';
		}else if(weekNumber == 4){
			weekNumberText = 'fourth';
		}else if(weekNumber == 5){
			weekNumberText = 'fifth';
		} */
		
		//let oldStartDate = moment(defaultProps.startDate).format('MM/DD/YYYY');
		
		return (<div className="repeat-section">
		
			<div className="row-input">
				<label className="label-control"> Start Date </label>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<Stack spacing={3}>
						<DesktopDatePicker
							label=""
							inputFormat="MM/dd/yyyy"
							value={defaultProps.newDate}
							onChange={this.handleChange}
							renderInput={(params) => <TextField {...params} />}
						/>
					</Stack>
				</LocalizationProvider>
			</div>
			<div className="row-input">
				<label className="label-control"> Repeat </label>
				<select className="form-control" name="recurring" onChange={this.getValue} value={defaultProps.recurring}>
					<option value="No">No</option>
					<option value="Yes">Yes</option>
				</select>
			</div>
			{defaultProps.recurring == 'Yes' ?
			<div className="repeat-input">
				<label className="label-control repeat-label"> Repeat every</label>
				<div className="row">
					<div className="col-md-4">
					<input className="form-control" type="number" name='repeatAfter' onChange={this.getValue} value={defaultProps.repeatAfter} />
					</div>
					<div className="col-md-8">
					<select className="form-control" name="repeatEvery" onChange={this.getValue} value={defaultProps.repeatEvery}>
						<option value="days">days</option>
						<option value="weeks">weeks</option>
						<option value="months">months</option>
						<option value="years">years</option>
					</select>
					</div>
				</div>
			</div>
			:null}
			{defaultProps.repeatEvery == 'weeks' ? 
			<div className="row-input">
				<label className="label-control"> Repeat On </label>
				<select id="repeatOnDay" className="form-control" name="repeatOnDay" onChange={this.getValue} value={defaultProps.repeatOnDay}>
					<option value="1">Monday</option>
					<option value="2">Tuesday</option>
					<option value="3">Wednesday</option>
					<option value="4">Thursday</option>
					<option value="5">Friday</option>
					<option value="6">Saturday</option>
					<option value="0">Sunday</option>
				</select>
				<p>Every {defaultProps.repeatAfter} {defaultProps.repeatEvery} on {defaultProps.onDayName}</p>
			</div>
			:null}
			
			{defaultProps.repeatEvery == 'months' ? 
			<div className="row-input">
				<label className="label-control"> Repeat On </label>
				<select id="repeatOnDay" className="form-control" name="repeatOnDay" onChange={this.getValue} value={defaultProps.repeatOnDay}>
					<option value={defaultProps.onDayNum}>On Day {defaultProps.onDayNum}</option>
					<option value={defaultProps.weekNumber+'|'+defaultProps.dayNumber}>On the {defaultProps.weekNumberText} {defaultProps.onDayName}</option>
				</select>
			</div>
			:null}
				
		</div>            
	)}
}

export default Recurring;