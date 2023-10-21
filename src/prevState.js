import React, { startTransition } from 'react';
import './style.css';
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Card, Nav, Col, Row, Image} from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';
import thunk from 'redux-thunk';
import {PropTypes} from 'prop-types';
import * as d3 from 'd3';
import { timeMinute } from 'd3';
import { timeFormat } from 'd3-time-format';


//REACT-REDUX part1 ends

class Main extends React.Component{
	constructor(props){
		super(props);
		this.showSVG = this.showSVG.bind(this);
	}
	shouldComponentUpdate(nextState, nextProps){
		return true;
	}

	componentWillMount(){
		$('body').addClass('backgroundColor');
	}
	componentWillUnmount(){
		document.removeEventListener('DOMContentLoaded', this.showSVG());
	}
	componentDidMount(){
		document.addEventListener('DOMContentLoaded', this.showSVG());
	}

	showSVG(){
		//Get the Json Data
		const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

		//Create new instance of xmlhttpRequest()
		const req = new XMLHttpRequest();
		req.open("GET", url, true);
		req.send();
		req.onload = () =>{
			const json = JSON.parse(req.responseText);

			//Defining the dataset
			const dataset = json.monthlyVariance;

			//Get minimum year, maximum year and baseTemperature
			const [maxYear, minYear, baseTemp] = [Math.max(...dataset.map(elem => elem.year)), Math.min(...dataset.map(elem => elem.year)), json.baseTemperature];

			//pass the minimum & maximum year and baseTemperature as text to .subHeading
			$('.subHeading').text(`${minYear} - ${maxYear}: base temperature ${baseTemp}℃`);
			

			//Define the height width and padding of the main svg
			const [w, h, padding] = [1590, 650, 150];

			//Define the height, width and padding for the sub svg
			const [sw, sh, spadding] = [490, 90, 40]
	
			//Create the svg
			const svg = d3.select("svg").attr("height", h).attr("width", w);

			//Create colorSvg
			const colorSvg = d3.select('#mainSvg').append('foreignObject').attr('width', sw + 3).attr('height', sh + 3).attr('x', 140).attr('y', 550).attr('id', 'colorFobject').append('svg').attr('height', sh).attr('width', sw).attr('id', 'colorSvg');
			
			const colorValues = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
			const [xScale, yScale, colorScale, colorYscale] = [
				d3.scaleTime()
					.range([padding, w - padding])
					.domain([d3.min(dataset, (d) => (new Date(d.year, 0, 0, 0, 0, 0, 0))),
							d3.max(dataset, (d) => (new Date(d.year, 0, 0, 0, 0, 0, 0)))]),
				d3.scaleLinear()
					.range([h - padding, padding])
					.domain([new Date(0, 11, 31, 0, 0, 0, 0), new Date(0, 0, 1, 0, 0, 0, 0)]),
				d3.scaleLinear().range([spadding, sw - spadding]).domain(d3.extent(colorValues, (d)=>(d))).nice(),
				d3.scaleLinear().range([sh - spadding, spadding]).domain([0, 1]),
			];

			//Rect shapes for main svg
			const mainRect = svg.selectAll("rect").data(dataset).enter().append("rect").attr('class', "cell").attr('data-month', d => d.month).attr('data-year', d => d.year).attr('data-temp', d => d.variance + json.baseTemperature).attr("width", `7px`).attr("height", `${(h - 2 * padding)/12}px`)
			.attr("y", d => yScale(new Date(0, d.month - 1, 1, 0, 0, 0, 0)))
			.attr("x", (d, i) => xScale(new Date(d.year, 0, 1, 0, 0, 0, 0)))
			.attr("fill", d => {
				if((d.variance + json.baseTemperature) <= 2.8){
					return '#4575b4';
				}else if(((d.variance + json.baseTemperature) > 2.8) && ((d.variance + json.baseTemperature) <= 3.9)){
					return '#74add1';
				}else if(((d.variance + json.baseTemperature) > 3.9) && ((d.variance + json.baseTemperature) <= 5.0)){
					return '#abd9e9';
				}else if(((d.variance + json.baseTemperature) > 5.0) && ((d.variance + json.baseTemperature) <= 6.1)){
					return '#e0f3f8';
				}else if(((d.variance + json.baseTemperature) > 6.1) && ((d.variance + json.baseTemperature) <= 7.2)){
					return '#ffffbf';
				}else if(((d.variance + json.baseTemperature) > 7.2) && ((d.variance + json.baseTemperature) <= 8.3)){
					return '#fee090';
				}else if(((d.variance + json.baseTemperature) > 8.3) && ((d.variance + json.baseTemperature) <= 9.5)){
					return '#fdae61';
				}else if(((d.variance + json.baseTemperature) > 9.5) && ((d.variance + json.baseTemperature) <= 10.6)){
					return '#f46d43';
				}else if(((d.variance + json.baseTemperature) > 10.6) && ((d.variance + json.baseTemperature) <= 11.7)){
					return '#d73027';
				}else if(((d.variance + json.baseTemperature) > 11.7) && ((d.variance + json.baseTemperature) <= 12.8)){
					return '#a21e17';
				}else{
					return '#7c0e09';
				}
			});
			/*console.log((new Date(1997, 0, 0, 0, 0, 0, 0)).toLocaleString('default', {month: 'long'}));
			console.log(new Date(1997, 0, 0, 0, 0, 0, 0).getFullYear());*/
			mainRect.on('mouseenter', (i, d)=>{
				d3.select("#mainSvg").append("foreignObject").style('text-justify', 'center').style("background-color", "green").attr('id', 'tooltipContainer').attr("height", "100px").attr("width", "150px").attr("x", xScale(new Date(d.year - 10, 0, 1, 0, 0, 0, 0))).attr("y", ()=>{
					console.log(d.month);
					if(d.month === 12 || d.month === 11){
						return yScale(new Date(0, d.month-14, 0, 0, 0, 0, 0));
					}else{
						return yScale(new Date(0, d.month-2, 0, 0, 0, 0, 0));
					}
				}).append("xhtml:div").attr("id", "tooltip").attr("class", "tooltipDiv").attr("data-year", d.year).html(`<div>${d.year} - ${(new Date(0, d.month, 0, 0, 0, 0, 0)).toLocaleString('default', {month: 'long'})}</div><div></div><div>${(json.baseTemperature + d.variance).toFixed(2)}℃</div><div>${d.variance}℃</div>`);
			})
			.on('mouseout', ()=>{
				d3.select('#tooltipContainer').remove();
				d3.select('#tooltip').remove();
			});

			//Create the x and y axis
			const [xAxis, yAxis, colorAxis, colorYaxis] = [
				d3.axisBottom(xScale).ticks(d3.timeYear.every(10)),
				d3.axisLeft(yScale)
					.tickFormat(d3.timeFormat("%B")) 
					.tickValues([...d3.timeMonths(new Date(0, 0, 1), new Date(0, 11, 31))]).ticks(14)
					.tickPadding(1)
                .tickSizeInner(20)
                .tickSizeOuter(20)
				,
				d3.axisBottom(colorScale)
				.tickFormat(d3.format(".1f"))
				.tickSizeInner(10).tickSizeOuter(20)
				.tickValues(colorValues).ticks(12),
				d3.axisLeft(colorYscale)
			]
			svg.append("g").attr('transform', `translate(0, ${h - padding})`).attr('id', 'x-axis').call(xAxis);
			svg.append("g").attr("transform", `translate(${padding}, 0)`).attr('id', 'y-axis').call(yAxis);
			colorSvg.append("g").attr('transform', `translate(0, ${sh - spadding})`).call(colorAxis);

			const colorValues2 = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
			const colorShapes = colorSvg.attr('id', 'legend').selectAll('rect').data(colorValues2).enter().append('rect')
			.attr('width', colorScale(2.1))
			.attr('height', (colorYscale(0) - colorYscale(2.5)))
			.attr('x', (d, i)=>(colorScale(i+2.8) + i * 4.1))
			.attr('y', colorYscale(2.5)).attr('fill', (d)=>((d === 2.8)?('#4575b4'):(d === 3.9)?('#74add1'):(d === 5.0)?('#abd9e9'):(d === 6.1)?('#e0f3f8'):(d === 7.2)?('#ffffbf'):(d === 8.3)?('#fee090'):(d === 9.5)?('#fdae61'):(d === 10.6)?('#f46d43'):(d === 11.7)?('#d73027'):('transparent'))).style('stroke', d=>((d < 12.8)?('black'):(''))).style('stroke-width', '2px');

			const foreignObject1 = svg.append('foreignObject');

			foreignObject1.attr('width', 20).attr('height', 60).attr('x', 5).attr('y', 250).style('text-justify', 'end').style('text-align', 'end').append("xhtml:h4").text('Months').attr('class', 'monthY');

			const foreignObject2 = svg.append('foreignObject');
			foreignObject2.attr('width', 60).attr('height', 20).style('text-justify', 'end').attr('y', 530).attr('x', 780).append("xhtml:h4").text('Years');
		}

	}


	render(){
		return(
			<div className="wrapperContainer">
				<div className="mainContainer">
					<div className='heading'>
						<h1 id="title">Monthly Global Land-Surface Temperature</h1>
						<h3 className='subHeading' id="description"></h3>
					</div>
					<svg id='mainSvg'></svg>
				</div>
			</div>
		);
	}
};

export default Main;