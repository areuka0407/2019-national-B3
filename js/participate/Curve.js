class Curve extends Clip {
    constructor(){
        super(...arguments);

        this.history = [];
    }    

    mousemove(e){
        const {width, height} = this.$canvas;
        this.ctx.clearRect(0, 0, width, height);       

        this.history.push(this.takeXY(e));
        this.repaint(this.ctx);
    }

    mouseup(e){
        this.viewport.unset();
    }

    /**
     * 선택과 병합을 위해 현재 그린 것을 다시 그릴 함수가 필요하다.
     */
    repaint(ctx){

        // 해당 객체가 선택되어 있으면 ... 
        if(this.active){
            ctx.lineWidth = parseInt(this.lineWidth) + 10;
            ctx.strokeStyle = this.selectColor;
            ctx.beginPath();
            this.history.forEach(path => {
                const [X, Y] = path;
                ctx.lineTo(X, Y);
            });
            ctx.stroke();
        }


        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.beginPath();
        this.history.forEach(path => {
            const [X, Y] = path;
            ctx.lineTo(X, Y);
        });
        ctx.stroke();
    }
}