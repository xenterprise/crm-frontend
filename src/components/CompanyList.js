import React, { useState } from 'react'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { getDocs } from 'firebase/firestore';
import { db, instancesRef, auth, } from '../config/firebase';
import { collection } from 'firebase/firestore';
import client from '../data/clients';
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUserCompanies, setClient} from "../redux/reducers/clients";
import { setCompanies } from '../redux/reducers/companies';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import  {setSelectedCompany, setSelectedCompanyId } from '../redux/reducers/selectedCompany';
import { deleteDoc, doc } from 'firebase/firestore';
import AddCompanyDialog from './D_NewCompany'
import { setCompanyDialog } from '../redux/reducers/dialogFlags';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import { setdetailsSelectedTab } from '../redux/reducers/uiControls';
import { useNavigate } from 'react-router-dom';
import { setSelectedClientId } from '../redux/reducers/selectedClient';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#1976D2",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));







function EnhancedTableToolbar() {

    const selectedCompanyId = useSelector((state) => state.selectedCompany.selectedCompanyId);
    const dispatch = useDispatch();


    const handleEdit = () => {
        dispatch(setCompanyDialog(true))

    };



    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(selectedCompanyId.length > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {selectedCompanyId.length > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {selectedCompanyId.length} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    All Companies
                </Typography>
            )}

            {selectedCompanyId.length > 0 ? (
                <Tooltip title="Edit">
                    <IconButton >
                        <EditIcon onClick={handleEdit} />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Filter list">
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}

export default function CompanyList() {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const selectedCompanyId1 = useSelector((state) => state.selectedCompany.selectedCompanyId);
    const companyRef = collection(db, instancesRef + auth.currentUser.uid + "/company");
    const companiesList = useSelector((state) => state.companies.companies);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const getCompany = async () => {
        //Read the Data
        //Set the Movie List
        try {
            const data = await getDocs(companyRef);
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            dispatch(setCompanies(filteredData));

        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        getCompany();
    }, []);


    const handleCompanySelected = (company) => {
        console.log("Selected Company:", company )

        dispatch(setSelectedCompanyId(company.id))
        dispatch(setSelectedCompany(company));
        
        dispatch(setSelectedClientId(company.primaryClientId))

    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClick = (path, tabIndex) => {
        // Dispatch your Redux actions before navigating
        dispatch(setdetailsSelectedTab(tabIndex))
        // Navigate to the /clients route
        navigate(path);
      };
    

    return (
        <div style={{ height: "auto", width: '98%', margin: "1%" }}>
            {console.log("Data", CompanyList)}

            <EnhancedTableToolbar />
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table" >
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>ID</StyledTableCell>
                            <StyledTableCell align="left">Company Name</StyledTableCell>
                            <StyledTableCell align="left">NTN</StyledTableCell>
                            <StyledTableCell align="left">City</StyledTableCell>
                            <StyledTableCell align="left">Phone</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companiesList
                            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Use slice to get the rows for the current page
                            .map((company) => (
                                <TableRow
                                    key={company.companySid}
                                    onClick={() => handleCompanySelected(company)}
                                    hover
                                    style={{
                                        backgroundColor: selectedCompanyId1.includes(company.id)
                                            ? 'rgba(173, 216, 230, 0.5)' // Light blue color for selected row
                                            : 'inherit', // Default background color
                                    }}>
                                    <TableCell component="th" scope="row">
                                        {company.companySid}
                                    </TableCell>
                                    <StyledTableCell align="left" onClick={()=>handleClick("/details", 1)}>{company.name}</StyledTableCell>
                                    
                                    <StyledTableCell align="left">{company.ntn}</StyledTableCell>
                                    <StyledTableCell align="left">{company.city}</StyledTableCell>
                                    <TableCell align="left">{company.phone}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 13, 25]}
                    component="div"
                    count={companiesList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}

                />
            </TableContainer>

        </div>
    )
}
