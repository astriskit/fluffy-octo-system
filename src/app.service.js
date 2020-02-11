import axios from "axios";

export const cancelSource = axios.CancelToken.source();

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
    const filter =
      regulations && functions
        ? `&filter={"where":{"regulation":{"inq":${regulations}}},"func":${functions}}`
        : "";
    return this._network
      .get(`/RegulationsQuestionsMappings?access_token=${token}${filter}`)
      .then(this.extractData);
  }

  getUserResponses({ token }) {
    let url = `/Responses?access_token=${token}`;
    return this._network
      .get(url, { cancelToken: cancelSource.token })
      .then(this.extractData);
  }

  getUsers({ token }) {
    let url = `/Users?access_token=${token}`;
    return this._network
      .get(url, { cancelToken: cancelSource.token })
      .then(this.extractData);
  }

  getUser({ token, userId }) {
    let url = `/Users/${userId}?access_token=${token}`;
    return this._network.get(url).then(this.extractData);
  }

  assignQueBlock({ token, functionGroup, userId }) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    const data = { functionGroup, userId };
    return this._network.put(
      `/Responses/assign?access_token=${token}`,
      data,
      config
    );
  }

  updateResponse({ id, userId: _, answer }, token) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    const data = { answer };
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

  signUp({ username, email, password, role }) {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    };
    return this._network
      .post(
        "/users",
        { email, password, role, username, emailVerified: true },
        config
      )
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
