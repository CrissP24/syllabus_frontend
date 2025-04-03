import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/test/';

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }

  getDocenteBoard() {
    return axios.get(API_URL + 'docente', { headers: authHeader() });
  }

  getEstudianteBoard() {
    return axios.get(API_URL + 'estudiante', { headers: authHeader() });
  }

  getOperadorBoard() {
    return axios.get(API_URL + 'operador_sistema', { headers: authHeader() });
  }

  getCoordinadorBoard() {
    return axios.get(API_URL + 'coordinador', { headers: authHeader() });
  }

  getSecretariaBoard() {
    return axios.get(API_URL + 'secretaria', { headers: authHeader() });
  }

  getDecanoBoard() {
    return axios.get(API_URL + 'decano', { headers: authHeader() });
  }

  getComisionSilabosBoard() {
    return axios.get(API_URL + 'comision_silabos', { headers: authHeader() });
  }
}

export default new UserService();
