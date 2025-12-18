import { signal } from "@preact/signals";
import { Component } from "preact";

class QueryInput extends Component {
  message = signal("");

  handleInput = (e: Event) => {
    this.message.value = (e.target as HTMLInputElement).value ?? "";
  };

  handleSend = () => {
    console.log(this.message.value);
  };

  render() {
    return (
      <div className={`flex items-center justify-between gap-2`}>
        <input type="text" placeholder="Ask anything about your data" className="input input-ghost w-full" value={this.message.value} onInput={this.handleInput} />
        <button
          type="submit"
          className="btn bg-blue-400 text-white hover:bg-blue-500 border-none"
          onClick={this.handleSend}
        >
          Send
        </button>
      </div>
    );
  }
};

export default QueryInput;
