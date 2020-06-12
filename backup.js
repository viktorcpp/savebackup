
var fs   = require('fs');
var path = require('path');
var ncp  = require('ncp').ncp;

class Backup
{
    constructor()
    {
        this.dirs      = [];
        this.max_dirs  = 10;
        this.timeout   = null;
        this.period    = 1.5; // in seconds
        this.PATH      = './Saves';
        this.dest_name = '';
        this.date_str  = '';
        this.counter   = 0;
        
        ncp.limit = 16;
        
        this.Main();
        
    } // constructor
    
    Main()
    {
        fs.watch( this.PATH, (eventType, filename) =>{ if( eventType == 'change' ){ this.OnChange(); } })
        
        this.OnChange();
        
    } // Main
    
    OnChange()
    {
        clearTimeout(this.timeout);
        this.timeout = setTimeout( ()=>{this.Backup();}, this.period*1000 );
        
    } // OnChange
    
    Backup()
    {
        let dest_date = new Date();
        let month     = dest_date.getMonth()+1;
            month     = month < 10 ? '0'+month : month;
        let date      = dest_date.getDate();
            date      = date < 10 ? '0'+date : date;
        let hour      = dest_date.getHours();
            hour      = hour < 10 ? '0'+hour : hour;
        let min       = dest_date.getMinutes();
            min       = min < 10 ? '0'+min : min;
        let sec       = dest_date.getSeconds();
            sec       = sec < 10 ? '0'+sec : sec;
        let msec      = dest_date.getMilliseconds();
            msec      = msec < 10 ? '00'+msec : msec;
            msec      = msec >= 10 && msec < 100 ? '0'+msec : msec;
        let year      = dest_date.getFullYear();
            
        this.date_str  = `${month}.${date}.${year} - ${hour}:${min}:${sec}:${msec}`;
        this.dest_name = `Saves_${month}_${date}_${year}_${hour}_${min}_${sec}_${msec}`;
        ncp( './Saves', this.dest_name, ()=>{this.OnCopy();} );
        
    } // Backup()

    OnCopy( err )
    {
        if (err) { return console.error(err); }
        this.counter++;
        console.log( `Copying complete: ${this.date_str}\n` );
        this.Clean();
        console.log(`\nWATCHING SAVES... [${this.counter}]\n`);
        
    } // OnCopy
    
    GetDirectories( path )
    {
        return fs.readdirSync(path).filter((file)=>
        {
            if( file.indexOf('Saves_')  != -1){ this.dirs.push(file); }
            
            return fs.statSync( `${path}/${file}` ).isDirectory();
        });
        
    } // GetDirectories
    
    SortExt( a, b )
    {
        return a.localeCompare(b);
        
    } // SortExt
    
    Clean()
    {
        this.dirs = [];
        this.GetDirectories('./');
        this.dirs.sort(this.SortExt);
        for( var x = 0; x < this.dirs.length - this.max_dirs; x++ )
        {
            console.log( `Removing: ${this.dirs[x]}` );
            this.Remove( `./${this.dirs[x]}` );
        }
        
    } // Clean
    
    Remove(dir)
    {
        var list = fs.readdirSync(dir);
        
        for( var i = 0; i < list.length; i++ )
        {
            var filename = path.join( dir, list[i] );
            var stat     = fs.statSync(filename);
            
            if(filename == "." || filename == "..") { }
            else if(stat.isDirectory())
            {
                this.Remove(filename);
                fs.rmdir(filename);
            }
            else{ fs.unlinkSync(filename); }
        }
        
        fs.rmdirSync(dir);
        
    } // Remove
    
} // class Backup

new Backup();
