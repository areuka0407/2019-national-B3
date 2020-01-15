class Text extends Clip {
    constructor(){
        super(...arguments);

        /**
         * focus :: input에 텍스트를 입력할 수 있는 상태가 될 때
         * blur :: focus 에서 벗어날 때
         */

        this.input = document.createElement("input");
        this.input.addEventListener("blur", e => this.unselect());
        this.input.classList.add("draw-input");
        this.input.style.font = this.font;
        this.input.style.color = this.fillStyle;

        this.data = null;
    }    

    mousedown(e){
        const [X, Y] = this.takeXY(e);

        let style = this.input.style;
        style.left = X + "px";
        style.top = Y + "px";

        this.viewport.$root.append(this.input);
    }

    mouseup(){
        this.input.focus();
    }

    unselect(){
        let text = this.input.value;
        
        // 텍스트가 없다면 삭제되어야 한다.
        if(text === ""){
            const {clipList} = this.viewport.currentTrack;
            let idx = clipList.findIndex(x => x === this); // 인덱스를 구해서
            clipList.splice(idx, 1); // 해당 인덱스에서 하나만큼 자른다.
            this.$canvas.remove();
            this.input.remove();
        }
        // 텍스트가 있다면 캔버스로 옮겨야 한다.
        else {
            let {offsetLeft, offsetTop} = this.input;
            
            this.data = {
                text: text,
                x: offsetLeft,
                y: offsetTop + parseInt(this.ctx.font)
            };
            this.input.remove();
            this.repaint(this.ctx);
        }
        this.viewport.unset();
    }

    repaint(ctx){
        if(this.data === null) return;
        const {x, y, text} = this.data;

        ctx.font = this.font;
        ctx.fillStyle = this.fillStyle;        

        if(this.active){
            ctx.strokeStyle = this.selectColor;
            ctx.lineWidth = 3;
            
            let lineHeight = parseInt(this.font);
            let {width} = ctx.measureText(text);
            ctx.strokeRect(x, y - lineHeight - 3, width, lineHeight + 6);
            
        }

        ctx.fillText(text, x, y);
    }
}