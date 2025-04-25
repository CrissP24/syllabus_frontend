// BoardAdmin.js
import React, { Component } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import Sidebar from "./Sidebar";
import Actividades from "./Actividades";
import Distrifunc from "./Distrifunc";
import Docente from "./Docente";
import FileUpload from "./FileUpload";
import DataTable from "./DataTable";
import ExcelGenerator from "./ExcelGenerator";
import UserService from "../services/user.service";
import EventBus from "../common/EventBus";
import Malla from "./Malla.component";
import GestionSyllabus from "./gestionsyllabus.component";
import Docenpri from "./Docenpri";
import UserManagement from "./UserManagement"; // Import the new component
import { motion } from "framer-motion";
import { UserCog, FileSpreadsheet, ClipboardList, Users, Database } from "lucide-react";

export default class BoardAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      activeSection: "none",
      excelData: [],
      selectedData: [],
    };
  }

  componentDidMount() {
    UserService.getAdminBoard().then(
      (response) => this.setState({ content: response.data }),
      (error) => {
        const message = error.response?.data?.message || error.message || error.toString();
        this.setState({ content: message });

        if (error.response?.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }

  setActiveSection = (section) => {
    this.setState({ activeSection: section });
  };

  handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const XLSX = require("xlsx");
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      this.setState({ excelData: jsonData });
    };
    reader.readAsBinaryString(file);
  };

  handleSelectionChange = (selectedData) => {
    this.setState({ selectedData });
  };

  renderActiveComponent = () => {
    const { activeSection, excelData, selectedData } = this.state;

    const componentMap = {
      actividades: <Actividades />,
      distrifunc: <Distrifunc />,
      docente: <Docente />,
      fileupload: <FileUpload onFileUpload={this.handleFileUpload} />,
      datatable: <DataTable data={excelData} onSelectionChange={this.handleSelectionChange} />,
      excelgenerator: <ExcelGenerator selectedData={selectedData} />,
      malla: <Malla />,
      syllabus: <GestionSyllabus />,
      docenpri: <Docenpri />,
      usermanagement: <UserManagement />, // Add UserManagement component
    };

    return (
      componentMap[activeSection] || (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Image src="/admin-panel.svg" alt="Panel Admin" fluid className="mb-4" style={{ maxHeight: "180px" }} />
          <h4>Bienvenido, Administrador</h4>
          <p className="text-muted">Desde aquí puedes gestionar las principales funcionalidades del sistema:</p>
          <Row className="justify-content-center mt-4">
            <Col xs={6} md={4} className="mb-4">
              <UserCog size={40} className="mb-2 text-success" />
              <h6>Gestión de Usuarios</h6>
              <small>Crear, editar y eliminar cuentas de docentes y estudiantes.</small>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <ClipboardList size={40} className="mb-2 text-success" />
              <h6>Control de Actividades</h6>
              <small>Organiza y distribuye funciones docentes.</small>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <FileSpreadsheet size={40} className="mb-2 text-success" />
              <h6>Importar y Exportar Datos</h6>
              <small>Sube archivos Excel o genera reportes.</small>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <Users size={40} className="mb-2 text-success" />
              <h6>Asignación de Mallas</h6>
              <small>Configura los módulos por periodo académico.</small>
            </Col>
            <Col xs={6} md={4} className="mb-4">
              <Database size={40} className="mb-2 text-success" />
              <h6>Gestión de Syllabus</h6>
              <small>Administra y revisa los documentos de planificación.</small>
            </Col>
          </Row>
        </motion.div>
      )
    );
  };

  render() {
    return (
      <Container fluid className="dashboard-container p-0">
        <Row className="min-vh-100">
          <Col md={2} className="bg-light sidebar shadow-sm p-0">
            <Sidebar setActiveSection={this.setActiveSection} />
          </Col>
          <Col
            md={10}
            className="main-content d-flex flex-column p-4"
            style={{ overflow: "auto", maxHeight: "100vh" }}
          >
            <motion.header
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="jumbotron bg-white rounded shadow-sm p-4 mb-3"
            >
              <Image src="/admin-banner.png" fluid className="mb-3 rounded" alt="Administrador" />
            </motion.header>
            <div
              className="flex-grow-1 bg-white rounded shadow-sm p-3 overflow-auto"
              style={{ minHeight: "60vh", maxHeight: "calc(100vh - 200px)" }}
            >
              {this.renderActiveComponent()}
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}