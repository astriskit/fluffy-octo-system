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

  getUserResponses({ token, userId = null }) {
    let url = `/Responses?access_token=${token}`;
    if (userId) {
      url += `&filter={"where":{"userId":"${userId}"}}`;
    }
    return this._network.get(url).then(this.extractData);
  }

  updateResponse({ id, userId: _, ...r }, token) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    const data = r;
    return this._network.patch(
      `/Responses/${id}?access_token=${token}`,
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

  getUserRegulations(userId, token) {
    return this._network
      .get(
        `RegulationsUsers?access_token=${token}&filter={"where":{"userId":"${userId}"}}`
      )
      .then(this.extractData);
  }
}

export default new AppService();
