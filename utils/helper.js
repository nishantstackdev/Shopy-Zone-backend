function uniqueName(name) {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}` + name
}

module.exports = {uniqueName}