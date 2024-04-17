import React, { useState, useEffect } from "react";
import { img_300, unavailable } from "../Components/config";
import Pagination from "../Components/Pagination";
import useGenre from "../useGenre";

const TV = () => {
  const [state, setState] = useState([]);
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState([]);
  const [value, setValue] = useState([]);
  const genreURL = useGenre(value);

  const apiKey = process.env.REACT_APP_TMDB_API_KEY;
  const fetchTrending = async () => {
    const data = await fetch(`
    https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=${genreURL}`);
    const dataJ = await data.json();
    setState(dataJ.results);
  };
  useEffect(() => {
    fetchTrending();
  }, [page, genreURL]);

  return (
    <>
      <div className="container">
        <div className="row py-5 my-5">
          {state.map((Val) => {
            const {
              name,
              title,
              poster_path,
              first_air_date,
              release_date,
              media_type,
              id,
            } = Val;
            return (
              <div className="col-md-3 col-sm-4 py-3" id="card" key={id}>
                <div className="card bg-dark" key={id}>
                  <img
                    src={poster_path ? `${img_300}/${poster_path}` : unavailable}
                    className="card-img-top pt-3 pb-0 px-3"
                    alt={title || name}
                  />
                  <div className="card-body">
                    <h5 className="card-title text-center fs-5">
                      {title || name}
                    </h5>
                    <div className="d-flex fs-6 align-items-center justify-content-evenly movie">
                      <div>{media_type === "movie" ? "Movie" : "TV"}</div>
                      <div>{first_air_date || release_date}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <Pagination page={page} setPage={setPage} />
        </div>
      </div>
    </>
  );
};

export default TV;
