import React, { useState, useEffect } from 'react';
import {
  TextField, Box, InputLabel, FormControl, Select, MenuItem, Button,
  ButtonGroup, FormHelperText, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function Docente() {
  const [abreviatura, setAbreviatura] = useState('');
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState('');
  const [errores, setErrores] = useState({ texto: '', abreviatura: '', estado: '', fechaInicio: '', fechaFinal: '' });
  const [listaFunciones, setListaFunciones] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [id, setId] = useState(null);
  const [accion, setAccion] = useState('agregar');
  const [abrirSnackbar, setAbrirSnackbar] = useState(false);
  const [mensajeSnackbar, setMensajeSnackbar] = useState('');

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFinal, setFechaFinal] = useState(null);
  const [idEliminar, setIdEliminar] = useState(null);

  const opcionesEstado = [
    { valor: 'Activado', etiqueta: 'Activado' },
    { valor: 'Desactivado', etiqueta: 'Desactivado' },
  ];

  useEffect(() => {
    mostrarFunciones();
  }, []);

  const handleChange = (event) => {
    setEstado(event.target.value);
    setErrores({ ...errores, estado: '' });
  };

  const handleTextChange = (event) => {
    const newTexto = event.target.value.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '');
    setTexto(newTexto);
    setErrores({ ...errores, texto: newTexto.trim() === '' ? 'Ingrese texto' : '' });
  };

  const handleAbreviaturaChange = (event) => {
    const nuevaAbreviatura = event.target.value.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '');
    setAbreviatura(nuevaAbreviatura);
    setErrores({ ...errores, abreviatura: nuevaAbreviatura.trim() === '' ? 'Ingrese texto' : '' });
  };
  

  const handleFechaInicioChange = (newDate) => {
    setFechaInicio(newDate);
    if (fechaFinal && newDate && fechaFinal < newDate) {
      setFechaFinal(null);
    }
    setErrores({ ...errores, fechaInicio: newDate ? '' : 'La fecha de inicio es obligatoria' });
  };

  const handleFechaFinalChange = (newDate) => {
    setFechaFinal(newDate);
    setErrores({ ...errores, fechaFinal: newDate ? '' : 'La fecha final es obligatoria' });
  };

  const handleAgregar = () => {
    setAccion('agregar');
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setTexto('');
    setAbreviatura('');
    setEstado('');
    setFechaInicio(null);
    setFechaFinal(null);
    setErrores({ texto: '', abreviatura: '', estado: '', fechaInicio: '', fechaFinal: '' });
    setTimeout(() => {
      document.getElementById('fs').focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const textoError = texto.trim() === '' ? 'Ingrese texto' : '';
    const abreviaturaError = abreviatura.trim() === '' ? 'Ingrese texto' : '';
    const estadoError = estado === '' ? 'Seleccione una opción' : '';
    const fechaInicioError = fechaInicio === null ? 'La fecha de inicio es obligatoria' : '';
    const fechaFinalError = fechaFinal === null ? 'La fecha final es obligatoria' : '';

    setErrores({ texto: textoError, abreviatura: abreviaturaError, estado: estadoError, fechaInicio: fechaInicioError, fechaFinal: fechaFinalError });

    if (textoError || abreviaturaError || estadoError || fechaInicioError || fechaFinalError) {
      enqueueSnackbar('Por favor, complete todos los campos requeridos, incluyendo las fechas.', { variant: 'error' });
      return;
    }
    const formatFecha = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

  const fechaInicioFormatted = formatFecha(fechaInicio);
  const fechaFinalFormatted = formatFecha(fechaFinal);

    if (accion === 'agregar') {
      const existe = listaFunciones.some((func) => func.funsus === texto);
      if (existe) {
        enqueueSnackbar('El período ya existe', { variant: 'error' });
        limpiarFormulario();
        return;
      }

      try {
        await Axios.post('http://localhost:5002/perio', {
          abre: abreviatura,
          peri: texto,
          fechai: fechaInicioFormatted,
          fechaf: fechaFinalFormatted,
          estaperi: estado,
        });
        limpiarFormulario();
        mostrarFunciones();
        enqueueSnackbar('Período registrado', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Error al registrar el período', { variant: 'error' });
        limpiarFormulario();
      }
    } else if (accion === 'editar' && id) {
      
      try {
        
        await Axios.put(`http://localhost:5002/perio/${id}`, {
          
          abre: abreviatura,
          peri: texto,
          fechai: fechaInicioFormatted,  
          fechaf: fechaFinalFormatted,
          estaperi: estado,  
        });
        mostrarFunciones();
        enqueueSnackbar('Período actualizado', { variant: 'success' });
        limpiarFormulario();
        setAccion('agregar');
      } catch (error) {
        enqueueSnackbar('Error al actualizar el período', { variant: 'error' });
      }
    }
  };

  const mostrarFunciones = async () => {
    try {
      const response = await Axios.get('http://localhost:5002/perio');
      if (Array.isArray(response.data)) {
        setListaFunciones(response.data);
      } else {
        setListaFunciones([]);  
      }
    } catch (error) {
      setListaFunciones([]);  
    }
  };

  const editarFuncion = (funcion) => {
    setId(funcion.codpre);
    setAbreviatura(funcion.abre);
    setTexto(funcion.peri);
    setFechaInicio(new Date(funcion.fechai));  
    setFechaFinal(new Date(funcion.fechaf));  
    
    setEstado(funcion.estaperi);
    setErrores({ texto: '', abreviatura: '', fechai: '', fechaf: '', estado: '' });
    setAccion('editar');
  };

  const eliminarFuncion = async (idEliminar) => {
    try {
      await Axios.delete(`http://localhost:5002/perio/${idEliminar}`);
      mostrarFunciones();
      enqueueSnackbar('Período eliminado', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al eliminar el Período', { variant: 'error' });
    }
  };

  return (
    <>
      <div className="contenedor">
        <h2>PERÍODOS</h2>
      </div>
      <Box
        component="form"
        width={500}
        display="flex"
        flexDirection="column"
        gap={2}
        p={2}
        sx={{ border: '2px solid grey', m: 30, mx: 60, mt: 5 }}
        onSubmit={handleSubmit}
      >
        <TextField
          id="fs"
          label="Código"
          variant="outlined"
          fullWidth
          required
          error={Boolean(errores.abreviatura)}
          helperText={errores.abreviatura || ''}
          value={abreviatura}
          onChange={handleAbreviaturaChange}
        />
        <TextField
          id="fs1"
          label="Período"
          variant="outlined"
          fullWidth
          required
          error={Boolean(errores.texto)}
          helperText={errores.texto || ''}
          value={texto}
          onChange={handleTextChange}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Fecha de Inicio"
            value={fechaInicio}
            onChange={handleFechaInicioChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
            required
            error={Boolean(errores.fechaInicio)}
            helperText={errores.fechaInicio || ''}
          />
          <DatePicker
            label="Fecha Final"
            value={fechaFinal}
            minDate={fechaInicio}  // Restringe la selección a fechas mayores o iguales a la fecha de inicio
            onChange={handleFechaFinalChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
            required
            error={Boolean(errores.fechaFinal)}
            helperText={errores.fechaFinal || ''}
          />
        </LocalizationProvider>
        <FormControl fullWidth>
          <InputLabel id="dl" sx={{ mt: 0 }}>
            Opción
          </InputLabel>
          <Select
            labelId="dl"
            id="ds"
            value={estado}
            variant="outlined"
            label="Estado"
            sx={{ mt: 0 }}
            onChange={handleChange}
            error={Boolean(errores.estado)}
            required
          >
            {opcionesEstado.map((opcion) => (
              <MenuItem value={opcion.valor} key={opcion.valor}>
                {opcion.etiqueta}
              </MenuItem>
            ))}
          </Select>
          {errores.estado && <FormHelperText error>{errores.estado}</FormHelperText>}
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Button
            type="submit"
            color="success"
            startIcon={<SaveIcon sx={{ ml: '0.5rem' }} />}
            sx={{ fontWeight: 'bold' }}
          >
            Guardar
          </Button>
          <Button
            color="info"
            startIcon={<AddCircleOutlineIcon sx={{ ml: '0.5rem' }} />}
            onClick={handleAgregar}
            sx={{ fontWeight: 'bold' }}
          >
            Nuevo
          </Button>
        </Box>
      </Box>
      <Box
        component="div"
        width={1000}
        display="flex"
        alignItems="center"
        gap={2}
        p={2}
        sx={{ border: '2px solid grey', m: 20, mx: 26, mt: -25 }}
      >
        <TableContainer component={Paper} sx={{ margin: '0 auto' }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center"><b>N.</b></TableCell>
                <TableCell align="center"><b>Código</b></TableCell>
                <TableCell align="center"><b>Periodo</b></TableCell>                
                <TableCell align="center"><b>Fecha de Inicio</b></TableCell>
                <TableCell align="center"><b>Fecha Final</b></TableCell>
                <TableCell align="center"><b>Estado</b></TableCell>
                <TableCell align="center"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listaFunciones.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={7}>No hay datos disponibles</TableCell>
                </TableRow>
              ) : (
                listaFunciones.map((funcion, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" align="center">{index + 1}</TableCell>
                    <TableCell align="center">{funcion.abre}</TableCell>
                    <TableCell align="center">{funcion.peri}</TableCell>                    
                    <TableCell align="center"> {funcion.fechai}</TableCell>
                    <TableCell align="center">{funcion.fechaf}</TableCell>                    
                    <TableCell align="center">{funcion.estaperi}</TableCell>
                    <TableCell align="center">
                      <ButtonGroup variant="contained" aria-label="button group">
                        <Button
                          color="success"
                          startIcon={<UpdateIcon sx={{ ml: '0.5rem' }} />}
                          onClick={() => editarFuncion(funcion)}
                        ></Button>
                        <Button
                          color="error"
                          startIcon={<DeleteForeverIcon sx={{ ml: '0.5rem' }} />}
                          onClick={() => {
                            setIdEliminar(funcion.codpre);
                            setMensajeSnackbar(`¿Seguro que desea eliminar el período "${funcion.abre}"?`);
                            console.log(funcion.codpre);
                            setAbrirSnackbar(true);
                          }}
                        ></Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Snackbar
        open={abrirSnackbar}
        autoHideDuration={6000}
        onClose={() => setAbrirSnackbar(false)}
        message={mensajeSnackbar}
        action={
          <>
            <Button color="secondary" size="small" onClick={() => setAbrirSnackbar(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              size="small"
              onClick={() => {
                eliminarFuncion(idEliminar);
                setAbrirSnackbar(false);
              }}
            >
              Confirmar
            </Button>
          </>
        }
      />
    </>
  );
}

export default Docente;