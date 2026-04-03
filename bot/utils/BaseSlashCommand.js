module.exports = class BaseSlashCommand {
    constructor(name, owner = true){
        this._name = name;
        this._owner = owner;
    }

    get name(){
        return this._name
    }
};