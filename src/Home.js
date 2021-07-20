import { useState } from "react";
import styles from "./styles/Home.module.css";

function Home() {
  const [url, setUrl] = useState({
    url: "",
  });

  const handleUrl = (e) => {
    setUrl({
      url: e.target.value,
    });
  };

  const handleJoin = (e) => {
      e.preventDefault();
      if (url.url !== "") {
          let newUrl = url.url.split("/");
          console.log(newUrl);
          window.location.href = `/room/${newUrl[newUrl.length-1]}`
      } else {
          let newUrl = Math.random().toString(36).substring(2, 7);
          console.log(newUrl);
          window.location.href = `/room/${newUrl}`;
      }
  }

  return (
    <div className={styles.container}>
      <header>
        <h1>Minimal<span>VideoChat</span></h1>
      </header>
      <main>
        <p>Crea o únete a reuniones fantásticas 
        de forma <span>100%</span> gratuita</p>

        <form onSubmit={handleJoin}>
          <div className={styles.inputContainer}>
            <input type="text" placeholder="ID de la reunión" onChange={handleUrl}/>
            <input className={styles.button} type="submit" value="Empezar reunión"/>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Home;
