(function() {
  const connections = [
    "Wie¿a koœcielna-Boisko", "Wie¿a koœcielna-Du¿y klon", "Du¿y klon-Boisko",
    "Du¿y klon-Las", "Du¿y klon-Ogród Fabienne", "Ogród Fabienne-Las",
    "Ogród Fabienne-Pastwisko", "Pastwisko-Du¿y d¹b", "Du¿y d¹b-RzeŸnia",
    "RzeŸnia-Wysoka topola", "Wysoka topola-Boisko", "Wysoka topola-Pa³ac",
    "Pa³ac-Du¿a sosna", "Du¿a sosna-Gospodarstw Jacques'a", "Gospodarstw Jacques'a-G³óg",
    "Du¿a sosna-G³óg", "G³óg-Ogród Gillesa", "Du¿a sosna-Ogród Gillesa",
    "Ogród Gillesa-Du¿y d¹b", "Ogród Gillesa-RzeŸnia", "Pa³ac-RzeŸnia"
  ]

  function storageFor(name) {
    let storage = Object.create(null)
    storage["schowki na jedzenie"] = ["schowek w dêbie", "schowek na ³¹ce", "schowek pod ¿ywop³otem"]
    storage["schowek w dêbie"] = "Dziura na trzeci¹ du¿¹ ga³êzi¹ od do³u. Kilka kawa³ków chleba i trochê szyszek."
    storage["shcowek na ³¹ce"] = "Zakopany pod pokrzywami (strona po³udniowa). Zdech³y w¹¿."
    storage["schowek pod ¿ywop³otem"] = "Œrodek ¿ywop³otu w ogrodzie Gillesa. Oznaczony rozga³êzionym patykiem. Dwie butelki piwa."
    storage["wrogowie"] = ["Pies Jacques'a", "RzeŸnik", "Ta jednonoga kawka", "Ch³opiec z wiatrówk¹"]
    if (name == "Wie¿a koœcielna" || name == "G³óg" || name == "Pa³ac")
      storage["events on 2017-12-21"] = "G³êboki œnieg. Œmieci rzeŸnika mog¹ siê przewróciæ. Przegoniliœmy kruki z Saint-Vulbas."
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    for (let y = 1985; y <= 2018; y++) {
      storage[`chicks in ${y}`] = hash % 6
      hash = Math.abs((hash << 2) ^ (hash + y))
    }
    if (name == "Du¿y d¹b") storage.scalpel = "Ogród Gillesa"
    else if (name == "Ogród Gillesa") storage.scalpel = "Las"
    else if (name == "Woods") storage.scalpel = "Pa³ac"
    else if (name == "Pa³ac" || name == "RzeŸnia") storage.scalpel = "RzeŸnia"
    else storage.scalpel = "Du¿y d¹b"
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
        return callback(new Error(`Nie ma dostêpu do ${to} z ${this.name}`))
      let handler = this[$network].types[type]
      if (!handler)
        return callback(new Error("Nieznany typ ¿¹dania " + type))
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
  exports.bigOak = network.nodes["Du¿y d¹b"]
  exports.everywhere = network.everywhere.bind(network)
  exports.defineRequestType = network.defineRequestType.bind(network)

  if (typeof __sandbox != "undefined") {
    __sandbox.handleDeps = false
    __sandbox.notify.onLoad = () => {
      // Sztuczka opóŸniaj¹ca wszystkie funkcje a¿ wszystkie wêz³y
      // podzia³aj¹ przez 500 ms, aby daæ im szansê na
      // rozes³anie informacji po sieci.
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
      if (name != "./crow-tech") throw new Error("Gniazda wron mog¹ ¿¹daæ tylko \"./crow-tech\"")
      return exports
    }
  } else if (typeof module != "undefined" && module.exports) {
    module.exports = exports
  }
})()