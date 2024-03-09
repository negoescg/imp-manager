import React from 'react';

const StatusCell = ({ value }) => {
  let backgroundColor = '';
  let color = '';
  switch (value) {
    case 'Pending':
      backgroundColor = 'orange';
      color = 'white';
      break;
    case 'Confirmed':
      backgroundColor = 'green';
      color = 'white';
      break;
    case 'In Progress':
      backgroundColor = 'orange';
      color = 'white';
      break;
    case 'Completed':
      backgroundColor = 'green';
      color = 'white';
      break;
    default:
      backgroundColor = 'transparent';
      color = 'black';
  }

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        color: color,
        padding: '5px',
        borderRadius: '4px',
        textAlign: 'center',
      }}>
      {value}
    </div>
  );
};

export default StatusCell;
