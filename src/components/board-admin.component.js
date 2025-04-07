import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
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
import Docenpri from "./Docenpri"; // ✅ Importación del nuevo componente

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
      (response) => {
        this.setState({
          content: response.data,
        });
      },
      (error) => {
        this.setState({
          content:
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString(),
        });

        if (error.response && error.response.status === 401) {
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
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
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
    switch (activeSection) {
      case "actividades":
        return <Actividades />;
      case "distrifunc":
        return <Distrifunc />;
      case "docente":
        return <Docente />;
      case "fileupload":
        return <FileUpload onFileUpload={this.handleFileUpload} />;
      case "datatable":
        return <DataTable data={excelData} onSelectionChange={this.handleSelectionChange} />;
      case "excelgenerator":
        return <ExcelGenerator selectedData={selectedData} />;
      case "malla":
        return <Malla />;
      case "syllabus":
        return <GestionSyllabus />;
      case "docenpri": // ✅ Nueva sección
        return <Docenpri />;
      default:
        return <p>Selecciona una opción para comenzar.</p>;
    }
  };

  render() {
    return (
      <Container fluid>
        <Row>
          <Col md={2} className="bg-light sidebar">
            <Sidebar setActiveSection={this.setActiveSection} />
          </Col>
          <Col md={10} className="main-content">
            <header className="jumbotron text-center">
              <h3>Panel Administrativo</h3>
              <p>Gestiona las funcionalidades clave de tu sistema desde este tablero.</p>
            </header>
            <div className="active-component">{this.renderActiveComponent()}</div>
          </Col>
        </Row>
      </Container>
    );
  }
}
