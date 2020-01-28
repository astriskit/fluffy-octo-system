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

  tokenHeader = token => ({ Access_token: token });

  getRegulationsFunctionsMapping(token) {
    return this._network
      .get(`/RegulationsFunctionsMappings?access_token=${token}`)
      .then(this.extractData);
  }

  getRegulationsQuestionsMapping({ regulations, functions, token }) {
    const config = {
      params: {
        where: JSON.stringify({
          regulation: { inq: regulations },
          func: functions
        })
      }
    };
    return this._network
      .get(`/RegulationsQuestionsMappings?access_token=${token}`, config)
      .then(this.extractData);
  }

  login(email, password) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    return this._network
      .post("/users/login", { email, password }, config)
      .then(this.extractData);
  }

  logout(token) {
    return this._network.post(`/users/logout?access_token=${token}`, {});
  }
}

export default new AppService();
