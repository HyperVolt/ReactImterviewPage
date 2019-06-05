import React, { Component } from 'react';
import './App.scss';
import axios from 'axios'
import EmployeeField from './EmployeeField';

var employeesTable = [];
var employeesTimeTableAfterSort = [];
var bookingInfo;

export default class App extends Component {
    constructor() {
        super();
        this.state = {
            availableRooms: "",
            reservedRooms: "",
            checkedIn: "",
            weekAvailabilityPercent: "",
            topEmployeeImages: [],
            topEmployeesNames: [],
            topEmployeesHours: []
        }
    }

    componentDidMount() {
        axios.get("https://interview-booking-api.herokuapp.com/api/booking-snapshot").then((response) => {
            console.log(response.data);
            this.setState({
                availableRooms: response.data.availableRooms, reservedRooms: response.data.reservedRooms, checkedIn: response.data.checkedIn,
                weekAvailabilityPercent: response.data.weekAvailabilityPercent
            });
        }).catch((error) => {
            console.log("Failed to load hotel rooms data, error: " + error);
        }).finally(() => {
            console.log("Finished loading hotel rooms data");
        });

        var employeesTimeTableBeforeSort = [];

        axios.get("https://interview-booking-api.herokuapp.com/api/bookings").then((response) => {
            console.log(response.data);
            bookingInfo = response.data;
        }).catch((error) => {
            console.log("Failed to load bookings data, error: " + error);
        }).finally(() => {
            console.log("Finished loading hotel booking data, calculating employees");
            bookingInfo.forEach(booking => {
                let currentEmployee = booking.employee;
                if (currentEmployee !== undefined) {
                    let result = employeesTable.findIndex(employee => employee.id === currentEmployee.id);
                    if (result === -1) {
                        employeesTable.push(currentEmployee);
                        employeesTimeTableBeforeSort.push(0);
                        console.log(currentEmployee.firstName + " " + currentEmployee.lastName[0] + ". has been added to the array");
                    } else {
                        console.log(currentEmployee.firstName + " " + currentEmployee.lastName[0] + ". is already in the array");
                    }
                    let startDate = new Date(this.peelDateFromObject(booking.checkInDate));
                    let endDate = new Date(this.peelDateFromObject(booking.checkOutDate));
                    let hoursDiffrence = Math.abs(startDate - endDate) / 36e5;
                    let advancedResults = employeesTable.findIndex(employee => employee.id === currentEmployee.id);
                    employeesTimeTableBeforeSort[advancedResults] += hoursDiffrence;
                }
            });

            console.log("\nNumber of employees: " + employeesTable.length);
            employeesTable.forEach((employee, index) => {
                console.log(employee.firstName + " " + employee.lastName[0] + ". in index number " + index + " sold: " + employeesTimeTableBeforeSort[index] + " hours of vacation");
            });

            employeesTimeTableBeforeSort.forEach(element => {
                employeesTimeTableAfterSort.push(element);
            });

            employeesTimeTableAfterSort.sort((a, b) => {
                if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                else {
                    return -1;
                }
            });

            let localTopEmployeeImages = [];
            let localTopEmployeesNames = [];
            let localTopemployessHours = [];

            console.log("\nTop employees are:");
            employeesTimeTableAfterSort.forEach((hours, index) => {
                if (index < 3) {
                    let result = employeesTimeTableBeforeSort.findIndex(hour => hour === hours);
                    console.log(employeesTable[result].firstName + " in index number " + index + " sold: " + employeesTimeTableAfterSort[index] + " hours of vacation");
                    localTopEmployeeImages.push(employeesTable[result].profileImageUrl);
                    console.log(employeesTable[result].profileImageUrl);
                    
                    localTopEmployeesNames.push(employeesTable[result].firstName + " " + employeesTable[result].lastName[0] + ".");
                    localTopemployessHours.push(employeesTimeTableAfterSort[index] + " hours");
                    console.log("\nChanging the " + employeesTimeTableAfterSort[index] + " to 0");
                    employeesTimeTableAfterSort[index] = 0;
                    employeesTimeTableBeforeSort[result] = 0;
                    console.log("After the changes");
                    console.log(employeesTimeTableAfterSort); 
                }
            });
            this.setState({topEmployeeImages: localTopEmployeeImages, topEmployeesNames: localTopEmployeesNames, topEmployeesHours: localTopemployessHours});
        });
    }

    peelDateFromObject(date) {
        let acceptableStartDate = String(date);
        let startDateDay = acceptableStartDate.substring(0, 2);
        let satrtDateMonth = acceptableStartDate.substring(3, 5);
        let startDateYear = acceptableStartDate.substring(6, 10);
        let newDate = startDateYear + "-" + satrtDateMonth + "-" + startDateDay;
        return newDate;
    }

    render() {
        return (
            <div className="App">
                <div className="Booking-Dashboard---simple">
                    <div style={{ marginTop: "100px" }}>
                        <div className="Row" style={{ marginLeft: "130px" }}>{this.state.availableRooms}</div>
                        <div className="Row" style={{ marginLeft: "270px" }}>{this.state.reservedRooms}</div>
                        <div className="Row" style={{ marginLeft: "270px" }}>{this.state.checkedIn}</div>
                    </div>
                    <div>
                        <div className="Rooms-available">Rooms available</div>
                        <div className="Reserved-rooms">Reserved rooms</div>
                        <div className="Checked-in">Checked in</div>
                    </div>
                    <hr className="Line" style={{ marginTop: "30px" }}></hr>
                    <div className="EmployeeStats" style={{ marginLeft: "130px" }}>Employee stats</div>
                    {
                        this.state.topEmployeeImages.map((item, key) => (
                            <EmployeeField key={key} imageSource={this.state.topEmployeeImages[key]} employeeName={this.state.topEmployeesNames[key]} employeeHours={this.state.topEmployeesHours[key]}/>
                        ))
                    }
                </div>
            </div>
        );
    }
}

