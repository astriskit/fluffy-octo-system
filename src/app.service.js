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

  // tokenHeader = token => ({ Access_token: token }); // !working as expected.

  getRegulationsFunctionsMapping(token) {
    return this._network
      .get(`/RegulationsFunctionsMappings?access_token=${token}`)
      .then(this.extractData);
  }

  getRegulationsQuestionsMapping({ regulations, functions, token }) {
    return this._network
      .get(
        `/RegulationsQuestionsMappings?access_token=${token}&filter={"where":{"regulation":{"inq":${regulations}}},"func":${functions}}`
      )
      .then(this.extractData);
  }

  saveResponse({ queId, ans, token }) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    const data = { questionId: queId, answer: ans };
    return this._network
      .post(`/Responses?access_token==${token}`, data, config)
      .then(this.extractData);
  }

  getResponse({ queId, token }) {
    // TODO
  }

  updateResponse({ ansId, queId, ans, token }) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    const data = { questionId: queId, answer: ans };
    return this._network.patch(
      `/Responses/${ansId}?access_token=${token}`,
      data,
      config
    );
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
