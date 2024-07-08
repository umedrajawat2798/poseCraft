import React, { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
import DotLoader from '../loaders/DotLoader';

const ImageTable = ({ shots, imageIds, imageStatuses }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Group shots by their _id
    const groupShotsById = (shots) => {
      return shots.reduce((grouped, shot) => {
        const { _id } = shot;
        if (!grouped[_id]) {
          grouped[_id] = [];
        }
        grouped[_id].push(shot);
        return grouped;
      }, {});
    };

    const groupedShots = groupShotsById(shots);

    // let data = Object.keys(imageStatuses).map(id => ({
    //   id,
    //   shots: [],
    //   status: imageStatuses[id].status,
    // }));

    // if (Object.keys(groupedShots).length) {
    //   data = Object.keys(groupedShots).map(id => ({
    //     id,
    //     shots: groupedShots[id],
    //     status: imageStatuses[id].status,
    //   }));
    // }

    // setTableData(data);

    const newData = Object.keys(imageStatuses).map(id => {
        const existingItem = tableData.find(item => item.id === id);
        const newShots = groupedShots[id] || (existingItem ? existingItem.shots : []);
        return {
          id,
          shots: newShots,
          status: imageStatuses[id].status,
        };
      });
  
      setTableData(newData);
  }, [shots, imageIds, imageStatuses]);

  const columns = useMemo(
    () => [
      {
        Header: 'Image ID',
        accessor: 'id',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Neck View',
        accessor: 'shots[0].url',
        Cell: ({ cell }) => {
          const { row } = cell
          if(row.original.status === "pending"){
            return <DotLoader props={{ width: 30 }}/>
          }
          return (
          cell.value ? <img src={cell.value} alt="Neck View" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'N/A'
        )},
      },
      {
        Header: 'Sleeve View',
        accessor: 'shots[1].url',
        Cell: ({ cell }) => {
            const { row } = cell
          if(row.original.status === "pending"){
            return <DotLoader props={{ width: 30 }}/>
          } return (
          cell.value ? <img src={cell.value} alt="Zoom View" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'N/A'
        )},
      },
      {
        Header: 'Zoomed View',
        accessor: 'shots[2].url',
        Cell: ({ cell }) => {
            const { row } = cell
          if(row.original.status === "pending"){
            return <DotLoader props={{ width: 30 }}/>
          }
          return cell.value ? <img src={cell.value} alt="Sleeve" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'N/A'
        },
      },
      {
        Header: 'Waist View',
        accessor: 'shots[3].url',
        Cell: ({ cell }) => {
            const { row } = cell
          if(row.original.status === "pending"){
            return <DotLoader props={{ width: 30 }}/>
          }
          return cell.value ? <img src={cell.value} alt="Length" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'N/A'
        },
      },
      {
        Header: 'Length View',
        accessor: 'shots[4].url',
        Cell: ({ cell }) => {
            const { row } = cell
          if(row.original.status === "pending"){
            return <DotLoader props={{ width: 30 }}/>
          }
          return cell.value ? <img src={cell.value} alt="Waist View" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'N/A'
        },
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: tableData });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;


  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const headerStyles = {
    backgroundColor: '#f8f8f8',
    borderBottom: '2px solid #ddd',
  };

  const cellStyles = {
    border: '1px solid #ddd',
    padding: '8px',
  };


  return (
    <div style={{ display: "grid", justifyItems: "center"}}>
      <h2>Generated Shots</h2>
      <table {...getTableProps()} style={{ width: '75%' }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()} style={{ }}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} style={{ ...cellStyles, ...headerStyles }}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} style={{ ...cellStyles, height: 200, alignContent: "center", textAlign: "center" }}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ImageTable;

