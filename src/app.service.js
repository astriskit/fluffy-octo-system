import axios from "axios";

class AppService {
  constructor() {
    this._network = axios.create({
      baseURL: "http://35.244.44.234:3001/api",
      headers: {
        Accept: "application/json"
      }
    });
  }

  extractData = ({ data }) => data;

  tokenHeader = token => ({ access_token: token });

  getRegulationsFunctionsMapping(token) {
    const config = {
      headers: this.tokenHeader(token)
    };
    return this._network
      .get("/RegulationsFunctionsMappings", config)
      .then(this.extractData);
  }

  getRegulationsQuestionsMapping({ regulations, functions, token }) {
    const config = {
      headers: this.tokenHeader(token),
      params: {
        where: JSON.stringify({
          regulation: { inq: regulations },
          func: functions
        })
      }
    };
    return this._network.get("/RegulationsQuestionsMappings", config);
  }

  login(email, password) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    return this._network.post("/users/login", { email, password }, config);
  }

  logout(token) {
    const config = { headers: this.tokenHeader(token) };
    return this._network.post("/userst/logout", {}, config);
  }
}

export default new AppService();
