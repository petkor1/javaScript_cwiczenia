(function() {
  const connections = [
    "Wie�a ko�cielna-Boisko", "Wie�a ko�cielna-Du�y klon", "Du�y klon-Boisko",
    "Du�y klon-Las", "Du�y klon-Ogr�d Fabienne", "Ogr�d Fabienne-Las",
    "Ogr�d Fabienne-Pastwisko", "Pastwisko-Du�y d�b", "Du�y d�b-Rze�nia",
    "Rze�nia-Wysoka topola", "Wysoka topola-Boisko", "Wysoka topola-Pa�ac",
    "Pa�ac-Du�a sosna", "Du�a sosna-Gospodarstw Jacques'a", "Gospodarstw Jacques'a-G��g",
    "Du�a sosna-G��g", "G��g-Ogr�d Gillesa", "Du�a sosna-Ogr�d Gillesa",
    "Ogr�d Gillesa-Du�y d�b", "Ogr�d Gillesa-Rze�nia", "Pa�ac-Rze�nia"
  ]

  function storageFor(name) {
    let storage = Object.create(null)
    storage["schowki na jedzenie"] = ["schowek w d�bie", "schowek na ��ce", "schowek pod �ywop�otem"]
    storage["schowek w d�bie"] = "Dziura na trzeci� du�� ga��zi� od do�u. Kilka kawa�k�w chleba i troch� szyszek."
    storage["shcowek na ��ce"] = "Zakopany pod pokrzywami (strona po�udniowa). Zdech�y w��."
    storage["schowek pod �ywop�otem"] = "�rodek �ywop�otu w ogrodzie Gillesa. Oznaczony rozga��zionym patykiem. Dwie butelki piwa."
    storage["wrogowie"] = ["Pies Jacques'a", "Rze�nik", "Ta jednonoga kawka", "Ch�opiec z wiatr�wk�"]
    if (name == "Wie�a ko�cielna" || name == "G��g" || name == "Pa�ac")
      storage["events on 2017-12-21"] = "G��boki �nieg. �mieci rze�nika mog� si� przewr�ci�. Przegonili�my kruki z Saint-Vulbas."
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    for (let y = 1985; y <= 2018; y++) {
      storage[`chicks in ${y}`] = hash % 6
      hash = Math.abs((hash << 2) ^ (hash + y))
    }
    if (name == "Du�y d�b") storage.scalpel = "Ogr�d Gillesa"
    else if (name == "Ogr�d Gillesa") storage.scalpel = "Las"
    else if (name == "Woods") storage.scalpel = "Pa�ac"
    else if (name == "Pa�ac" || name == "Rze�nia") storage.scalpel = "Rze�nia"
    else storage.scalpel = "Du�y d�b"
    for (let prop of Object.keys(storage)) storage[prop] = JSON.stringify(storage[prop])
    return storage
  }

  class Network {
    constructor(connections, storageFor) {
      let reachable = Object.create(null)
      for (let [from, to] of connections.map(conn => conn.split("-"))) {
        ;(reachable[from] || (reachable[from] = [])).push(to)
        ;(reachable[to] || (reachable[to] = [])).push(from)
      }
      this.nodes = Object.create(null)
      for (let name of Object.keys(reachable))
        this.nodes[name] = new Node(name, reachable[name], this, storageFor(name))
      this.types = Object.create(null)
    }

    defineRequestType(name, handler) {
      this.types[name] = handler
    }

    everywhere(f) {
      for (let node of Object.values(this.nodes)) f(node)
    }
  }

  const $storage = Symbol("storage"), $network = Symbol("network")

  function ser(value) {
    return value == null ? null : JSON.parse(JSON.stringify(value))
  }

  class Node {
    constructor(name, neighbors, network, storage) {
      this.name = name
      this.neighbors = neighbors
      this[$network] = network
      this.state = Object.create(null)
      this[$storage] = storage
    }

    send(to, type, message, callback) {
      let toNode = this[$network].nodes[to]
      if (!toNode || !this.neighbors.includes(to))
        return callback(new Error(`Nie ma dost�pu do ${to} z ${this.name}`))
      let handler = this[$network].types[type]
      if (!handler)
        return callback(new Error("Nieznany typ ��dania " + type))
      if (Math.random() > 0.03) setTimeout(() => {
        try {
          handler(toNode, ser(message), this.name, (error, response) => {
            setTimeout(() => callback(error, ser(response)), 10)
          })
        } catch(e) {
          callback(e)
        }
      }, 10 + Math.floor(Math.random() * 10))
    }

    readStorage(name, callback) {
      let value = this[$storage][name]
      setTimeout(() => callback(value && JSON.parse(value)), 20)
    }

    writeStorage(name, value, callback) {
      setTimeout(() => {
        this[$storage][name] = JSON.stringify(value)
        callback()
      }, 20)
    }
  }

  let network = new Network(connections, storageFor)
  exports.bigOak = network.nodes["Du�y d�b"]
  exports.everywhere = network.everywhere.bind(network)
  exports.defineRequestType = network.defineRequestType.bind(network)

  if (typeof __sandbox != "undefined") {
    __sandbox.handleDeps = false
    __sandbox.notify.onLoad = () => {
      // Sztuczka op�niaj�ca wszystkie funkcje a� wszystkie w�z�y
      // podzia�aj� przez 500 ms, aby da� im szans� na
      // rozes�anie informacji po sieci.
      let waitFor = Date.now() + 500
      function wrapWaiting(f) {
        return function(...args) {
          let wait = waitFor - Date.now()
          if (wait <= 0) return f(...args)
          return new Promise(ok => setTimeout(ok, wait)).then(() => f(...args))
        }
      }
      for (let n of ["routeRequest", "findInStorage", "chicks"])
        window[n] = wrapWaiting(window[n])
    }
  }

  if (typeof window != "undefined") {
    window.require = name => {
      if (name != "./crow-tech") throw new Error("Gniazda wron mog� ��da� tylko \"./crow-tech\"")
      return exports
    }
  } else if (typeof module != "undefined" && module.exports) {
    module.exports = exports
  }
})()