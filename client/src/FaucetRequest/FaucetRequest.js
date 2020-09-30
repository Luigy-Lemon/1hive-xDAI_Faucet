import React, { Component } from "react";
import "./FaucetRequest.css";
import Eth from "ethjs";
import config from "react-global-configuration";
import axios from "axios";

class FaucetRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      targetAccount: "",
      selectedNetwork: "xdai",
      selectedToken: "xdai",
      requestrunning: false,
    };
    this.networkChange = this.networkChange.bind(this);
    this.tokenChange = this.tokenChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
  }
  tokenChange(e) {
    this.setState({
      selectedToken: e.currentTarget.value
    })


  }
  networkChange(e) {
    this.setState({
      selectedNetwork: e.currentTarget.value
    })
  }
  handleChange(event) {
    this.setState({ targetAccount: event.target.value });
  }

  clearMessages(event) {
    this.setState({ faucetresponse: null, fauceterror: null });
  }

  handleSubmit(event) {
    this.clearMessages();
    if (Eth.isAddress(this.state.targetAccount)) {
      this.setState({ requestrunning: true });

      let apiUrl = config.get("apiurl") + "/" + this.state.selectedNetwork + "/" + this.state.selectedToken + "/" + this.state.targetAccount;
      axios
        .get(apiUrl)
        .then(response => {
          this.setState({ requestrunning: false });
          if (response.status === 200) {
            this.setState({
              faucetresponse: {
                txhash: response.data.hash,
                // console.log()
                etherscanlink:
                  config.get([this.state.selectedNetwork]) + "/tx/" + response.data.hash
              }
            });
            return;
          }
        })
        // Catch any error here
        .catch(error => {
          this.setState({ requestrunning: false });
          if (!error || !error.response) {
            this.setState({
              fauceterror: {
                message: 'Error connecting to the API: ' + error.message,
              }
            });
            return;
          }
          if (error.response.status === 500) {
            // console.log(error.response)
            if (error.response.data.duration) {
              let t = Math.ceil(error.response.data.err.duration / 1000);
              this.setState({
                fauceterror: {
                  message: error.response.data.message,
                  duration: error.response.data.duration,
                  timespan: t
                }
              });
            } else {
              this.setState({
                fauceterror: {
                  message: 'Transaction error'
                }
              })
            }
            return;
          }
        });
    } else {
      this.setState({ fauceterror: { message: "invalid address" } });
    }
    event.preventDefault();
  }

  componentDidMount() {
    window.addEventListener("load", () => {
      // See if there is a pubkey on the URL
      let urlTail = window.location.search.substring(1);
      if (Eth.isAddress(urlTail)) {
        this.setState({ targetAccount: urlTail });
        return;
      }

      // If web3 is not injected (modern browsers)...
      if (typeof window.web3 === "undefined") {
        // Listen for provider injection
        window.addEventListener("message", ({ data }) => {
          if (data && data.type && data.type === "ETHEREUM_PROVIDER_SUCCESS") {
            this.eth = new Eth(window.ethereum);
          }
        });
        // Request provider
        window.postMessage({ type: "ETHEREUM_PROVIDER_REQUEST" }, "*");
      }
      // If web3 is injected (legacy browsers)...
      else {
        this.eth = new Eth(window.web3.currentProvider);
        this.eth
          .accounts()
          .then(accounts => {
            if (accounts && accounts[0]) {
              this.setState({ targetAccount: accounts[0] });
            }
          })
          .catch(() => { });
      }
    });
  }

  render() {
    return (
      <div className="">
        <section className="section">
          <div className="container bottompadding">
            <h3>With xDAI, $0.01 allows you to do a lot transactions</h3>
            <hr></hr>
            
            <form onSubmit={this.handleSubmit}>
              <div className="field">
                <label className="label">
                  Enter your xDAI account address 
                </label>
                <div className="control">
                  <input
                    className="input is-info"
                    type="text"
                    placeholder="Enter your xDAI account address (case-sensitive)"
                    value={this.state.targetAccount}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              <hr></hr>
              <div className="field is-grouped">
                <div className="control">
                  <button
                    disabled={this.state.requestrunning}
                    className="button is-link"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
          {this.state.requestrunning}

          <div className="container">
            {this.state.faucetresponse ? (
              <div>
                <hr />
                <article
                  className="message is-success"
                  onClick={this.clearMessages}
                >
                  <div className="message-body">
                    <p>Tokens sent to {this.state.targetAccount}.</p>
                    <p>
                      Transaction hash{" "}
                      <a
                        target="_new"
                        href={this.state.faucetresponse.etherscanlink}
                      >
                        {this.state.faucetresponse.txhash}
                      </a>
                    </p>
                  </div>
                </article>
              </div>
            ) : (
                <p />
              )}
            {this.state.fauceterror ? (
              <div>
                <hr />
                <article
                  className="message is-danger"
                  onClick={this.clearMessages}
                >
                  <div className="message-body">
                    <b>{this.state.fauceterror.message}</b><br />
                    {this.state.fauceterror.timespan ? (
                      <span>
                        You are greylisted for another{" "}
                        {this.state.fauceterror.timespan} seconds.
                      </span>
                    ) : (
                        <span />
                      )}
                  </div>
                </article>
              </div>
            ) : (
                <p />
              )}
          </div>
        </section>
      </div>
    );
  }
}

export default FaucetRequest;
