var fs = require("fs");

class JsonDB{
    
    constructor(path){
        this.path = path;
    }

    readFile(){
        try{
            if(fs.existsSync(this.path)){
                this.data = JSON.parse(fs.readFileSync(this.path))
            } else {
                fs.writeFileSync(this.path, JSON.stringify({}));
                this.data = {};
            }
        } catch(e){
            console.log(e);
        }
    }

    writeFile(){
        try{
            fs.writeFileSync(this.path, JSON.stringify(this.data));
        } catch(e){
            console.log(e);
        }
    }

    createTable(name){
        this.readFile();
        if(!this.data.hasOwnProperty(name)){
            this.data[name] = {
                data: [],
                index: 0
            };
            this.writeFile();
        }
    }

    create(tableName, obj){
        this.readFile();
        try{
            if(!this.data[tableName]) this.createTable(tableName);
            obj.id = this.data[tableName].index++;
            this.data[tableName].data.push(obj);
            this.writeFile();
            return obj;
        } catch(e){
            console.log(e);
        }
    }

    get(tableName, filterFunction){
        this.readFile();
        try{
            const list = this.data[tableName].data;
            if(!filterFunction) return list[0];
            return list.find(filterFunction)
        } catch(e){
            console.log(e);
        }
    }

    list(tableName, filterFunction){
        this.readFile();
        try{
            const list = this.data[tableName].data;
            if(!filterFunction) return list;
            return list.filter(filterFunction)
        } catch(e){
            console.log(e);
        }
    }

    update(tableName, id, obj){
        this.readFile();
        try{
            const idx = this.data[tableName].data.findIndex(item=>item.id == id);
            if(idx == -1) return;
            for(let key in obj){
                this.data[tableName].data[idx][key] = obj[key]
            }
            this.writeFile();
            return this.data[tableName].data[idx];
        } catch(e){
            console.log(e);
        }
    }

    delete(tableName, id){
        this.readFile();
        try{
            this.data[tableName].data = this.data[tableName].data.filter(item=>item.id != id);
            this.writeFile();
        } catch(e){
            console.log(e);
        }
    }
}

module.exports = JsonDB;