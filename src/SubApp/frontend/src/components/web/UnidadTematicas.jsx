import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Box } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import SchoolIcon from '@mui/icons-material/School'; // Icono para el título
import '../css/Unidad.css'; // Importar archivo CSS

const UnidadesTematicas = () => {
    const [unidades, setUnidades] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredUnidades, setFilteredUnidades] = useState([]);

    useEffect(() => {
        const fetchUnidadesTematicas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/unidad_tematica');
                setUnidades(response.data);
                setFilteredUnidades(response.data);
            } catch (error) {
                console.error('Error al obtener las unidades temáticas:', error);
            }
        };

        fetchUnidadesTematicas();
    }, []);

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchText(value);
        const filteredData = unidades.filter((unidad) =>
            Object.keys(unidad).some((key) =>
                String(unidad[key]).toLowerCase().includes(value)
            )
        );
        setFilteredUnidades(filteredData);
    };

    const columns = [
        { field: 'nombre_unidad', headerName: 'Nombre Unidad', width: 200 },
        { field: 'version_malla', headerName: 'Versión Malla', width: 150 },
        { field: 'nom_carrera', headerName: 'Nombre Carrera', width: 200 },
        { field: 'nom_facultad', headerName: 'Nombre Facultad', width: 200 },
    ];

    const groupedData = filteredUnidades.reduce((acc, unidad) => {
        const { nom_facultad, nom_carrera } = unidad;
        if (!acc[nom_facultad]) {
            acc[nom_facultad] = {};
        }
        if (!acc[nom_facultad][nom_carrera]) {
            acc[nom_facultad][nom_carrera] = [];
        }
        acc[nom_facultad][nom_carrera].push(unidad);
        return acc;
    }, {});

    return (
        <Container maxWidth="md" style={{ fontFamily: 'Georgia' }}>
            <Typography variant="h5" component="h2" gutterBottom style={{ display: 'flex', alignItems: 'center', fontFamily: 'Georgia' }}>
                <SchoolIcon style={{ marginRight: '10px' }} /> Unidades Temáticas
            </Typography>
            <Box mb={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar..."
                    value={searchText}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        style: { fontFamily: 'Georgia' }
                    }}
                />
            </Box>
            {Object.keys(groupedData).map((facultad) => (
                <div key={facultad} style={{ marginBottom: '20px' }}>
                    <Typography variant="h6" component="h3" gutterBottom style={{ fontFamily: 'Georgia' }}>
                        {facultad}
                    </Typography>
                    {Object.keys(groupedData[facultad]).map((carrera) => (
                        <div key={carrera} style={{ marginBottom: '10px' }}>
                            <Typography variant="subtitle1" component="h4" gutterBottom style={{ fontFamily: 'Georgia', marginLeft: '20px' }}>
                                {carrera}
                            </Typography>
                            <div style={{ 
                                height: 400, 
                                width: '100%', 
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
                                borderRadius: '10px', 
                                padding: '10px', 
                                backgroundColor: '#fff',
                                border: '1px solid #ddd' // Añadir borde suave
                            }}>
                                <DataGrid
                                    rows={groupedData[facultad][carrera]}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    checkboxSelection
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id_unidad}
                                    components={{
                                        Toolbar: () => (
                                            <GridToolbarContainer>
                                                <GridToolbarExport />
                                            </GridToolbarContainer>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f5f5f5',
                                            fontFamily: 'Georgia',
                                            fontWeight: 'bold',
                                            color: '#333' // Color de texto
                                        },
                                        '& .MuiDataGrid-cell': {
                                            fontFamily: 'Georgia',
                                            padding: '10px', // Añadir relleno a las celdas
                                        },
                                        '& .MuiDataGrid-row:hover': {
                                            backgroundColor: '#f1f1f1' // Color al pasar el cursor por la fila
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            backgroundColor: '#3d7d3f', // Fondo de la paginación
                                            color: 'white', // Letras blancas en la paginación
                                            fontFamily: 'Georgia', // Aplicar fuente Georgia
                                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                                color: 'white', // Letras blancas en los selectores de paginación
                                                fontFamily: 'Georgia', // Fuente Georgia
                                            },
                                            '& .MuiSelect-icon': {
                                                color: 'white', // Icono de select en blanco
                                            },
                                            '& .MuiInputBase-root': {
                                                color: 'white', // Letras blancas en los selects
                                                fontFamily: 'Georgia', // Fuente Georgia
                                                '& .MuiInputBase-input': {
                                                    backgroundColor: '#3d7d3f', // Fondo en el dropdown del select
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </Container>
    );
};

export default UnidadesTematicas;
