class Rect extends Clip {
    constructor(){
        super(...arguments);

        this.data = null;
        this.complate = false; // 이 사각형이 다 그려졌는지 확인하는 변수
    }    

    mousedown(e){
        const [X, Y] = this.takeXY(e);

        this.data = { x: X, y: Y, w: 1, h: 1 };
    }

    mousemove(e){
        const [X, Y] = this.takeXY(e);
        const {x, y} = this.data;

        let w = X - x;
        let h = Y - y;

        this.data.w = w;
        this.data.h = h;

        const {width, height} = this.$canvas;
        this.ctx.clearRect(0, 0, width, height);       

        this.repaint(this.ctx);
    }

    mouseup(){
        const {width, height} = this.$canvas;
        this.ctx.clearRect(0, 0, width, height);       

        this.complate = true;
        this.viewport.unset();
        this.repaint(this.ctx);
    }

    repaint(ctx){
        if(this.data === null) return;

        const {x, y, w, h} = this.data;

        if(this.active){
            ctx.fillStyle = this.selectColor;
            ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
        }

        

        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;

        
        if(this.complate) this.ctx.fillRect(x, y, w, h);
        else this.ctx.strokeRect(x, y, w, h);
        
    }
}