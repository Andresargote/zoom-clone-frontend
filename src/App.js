import "./styles/App.css";
import Home from "./Home";
import VideoDos from "./VideoDos";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact component={Home}/>
          <Route path="/room/:url" exact component={VideoDos}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
