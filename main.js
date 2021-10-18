// Date Format //
Vue.filter("formatDate", function (d) {
  if (!window.Intl) return d;
  return new Intl.DateTimeFormat("el-GR").format(new Date(d));
});
function sortByProperty(property) {
  return function (a, b) {
    if (a[property] < b[property]) return 1;
    else if (a[property] > b[property]) return -1;

    return 0;
  };
}
function unique(obj) {
  var uniques = [];
  var stringify = {};
  for (var i = 0; i < obj.length; i++) {
    var keys = Object.keys(obj[i]);
    keys.sort(function (a, b) {
      return a - b;
    });
    var str = "";
    for (var j = 0; j < keys.length; j++) {
      str += JSON.stringify(keys[j]);
      str += JSON.stringify(obj[i][keys[j]]);
    }
    if (!stringify.hasOwnProperty(str)) {
      uniques.push(obj[i]);
      stringify[str] = true;
    }
  }
  return uniques;
}
// Search App //
const app = new Vue({
  el: "#app",
  data: {
    term: "",
    result: [],
    noResults: false,
    searching: false,
    audio: null,
    offset: 0,
    newResults: [],
    more: false,
    results: [],
    anio: null,
    month: null,
    intento: 0,
    monthNames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    limite: 0,
    maximo: 200,
  },
  methods: {
    search: function () {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }

      this.offset = 0;
      this.searching = true;
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          this.term
        )}&country=MX&offset=${this.offset}&limit=${this.maximo}&media=music`
      )
        .then((res) => res.json())
        .then((res) => {
          this.searching = false;
          this.newResults = [];
          this.newResults = this.newResults.concat(
            res.results.filter((number) => number.trackCount > 4)
          );

          if (parseInt(this.anio) > 0){
            this.newResults = this.newResults.filter(
              (number) =>
                new Date(number.releaseDate).getFullYear() ===
                parseInt(this.anio)
            );
          }

          if (parseInt(this.month) >= 0)
            this.newResults = this.newResults.filter(
              (number) =>
                new Date(number.releaseDate).getMonth() ===
                parseInt(this.month)
            );

          if (this.newResults.length === 0) {
            this.intento++;
            if (this.intento < this.limite) this.load_more();
          } else {
            this.intento = 0;
            this.newResults = unique(this.newResults);
            this.results = this.newResults;
            this.results.sort(sortByProperty("releaseDate"));
            console.log(this.results);
            this.noResults = this.results.length === 0;
            this.newResults = this.results;
            if (this.newResults.length > 0) {
              this.more = true;
            }
          }
        }).catch(function(error) {
			console.log('Hubo un problema con la petición Fetch:' + error.message);
		  });
    },
    load_more: function () {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.searching = true;
      this.offset += this.maximo;
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          this.term
        )}&country=MX&offset=${this.offset}&limit=${this.maximo}&media=music`
      )
        .then((res) => res.json())
        .then((res) => {
          let inicio = this.newResults.length;
          this.searching = false;
          this.newResults = this.results.concat(
            res.results.filter((number) => number.trackCount > 4)
          );
          if (parseInt(this.anio) > 0)
            this.newResults = this.newResults.filter(
              (number) =>
                new Date(number.releaseDate).getFullYear() ===
                parseInt(this.anio)
            );
            if (parseInt(this.month) >= 0)
            this.newResults = this.newResults.filter(
              (number) =>
                new Date(number.releaseDate).getMonth() ===
                parseInt(this.month)
            );
          this.newResults = unique(this.newResults);

          this.results = this.newResults;

          this.results.sort(sortByProperty("releaseDate"));
          console.log(this.results);
          this.noResults = this.results.length === 0;
          if (this.results.length > 0) {
            this.more = true;
            if (this.results.length < 80000) {
              this.intento++;
              if (this.intento < this.limite) this.load_more();
            } else {
              this.intento = 0;
            }
          }
        }).catch(function(error) {
			console.log('Hubo un problema con la petición Fetch:' + error.message);
		
		  });
    },
    play: function (a) {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.audio = new Audio(a);
      this.audio.play();
    },
    stop: function (a) {
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
      this.audio = new Audio(a);
      this.audio.pause();
    },
    visit: function (b) {
      window.open(b);
    },
  },
});
