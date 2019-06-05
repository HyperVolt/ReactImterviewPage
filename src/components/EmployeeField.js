import React, { Component } from 'react';
import './App.scss';

class EmployeeField extends Component {
    render() {
        return (
            <div>
                <img className="Bitmap" src={this.props.imageSource} />
                <div className="Name" style={{ marginLeft: "65px", color: "#ffffff" }}>{this.props.employeeName}</div>
                <div className="Name" style={{ marginLeft: "10px" }}>{this.props.employeeHours}</div>
            </div>            
        );
    }
}

export default EmployeeField;