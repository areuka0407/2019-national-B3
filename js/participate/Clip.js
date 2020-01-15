/**
 * 뷰 포트 내에서 보여지는 클립들
 * 공통적인 부분은 Clip 에서, 마우스 이벤트 같이 따로 이뤄지는 부분은 분류하여 정리하였다.
 * 각 클립마다 개별 캔버스를 두어 처음 생성할 때엔 repaint로 자신의 캔버스에 그리도록 하고,
 * 나중에 합친 뒤에는 대표격이 된 한 클립의 캔버스의 모든 클립의 repaint를 집중시킬 것이다.
 */

class Clip {
    constructor(app){
        this.selectColor = "#E94988";

        this.active = false;
        this.startTime = 0;
        this.endTime = app.viewport.currentTrack.$video.duration;
        this.mergeList = [this]; // 병합된 클립들의 목록

        this.app = app;

        // 캔버스 내 설정
        this.viewport = app.viewport;
        this.$canvas = document.createElement("canvas");
        this.$canvas.width = this.viewport.width;
        this.$canvas.height = this.viewport.height;
        this.ctx = this.$canvas.getContext("2d");

        // App 의 설정들을 복사해 온다.
        this.fillStyle = app.color;
        this.strokeStyle = app.color;
        this.font = `${app.fontSize} NanumSquare, sans-serif`;
        this.lineWidth = app.width;
        this.ctx.lineCap = "round";

        this.$line = this.lineTemplate(); // 하단에 생기는 클립 막대기 생성
        this.$viewLine = this.$line.querySelector(".view-line");
        this.lineCopied = null;
    }

    check(e){
        const [X, Y] = this.takeXY(e);
        const {offsetLeft, offsetTop} = this.$canvas;
        let data = this.ctx.getImageData(X - offsetLeft, Y - offsetTop, 1, 1).data[3]; // 해당 위치의 투명도(alpha) 값을 가져온다.
        return data !== 0; // 해당 위치의 투명도가 0이 아니면(true) 이 캔버스 내에서 그려진 것이 있는 것 = 선택되어야 한다.
    }

    clear(ctx = this.ctx){
        const {width, height} = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
    }

    render(){
        this.mergeList.forEach(x => x.repaint(this.ctx));
    }

    setSelect(val){
        this.mergeList.forEach(x => x.active = val);
    }

    takeXY(e){
        const {pageX, pageY} = e;
        const {offsetWidth, offsetHeight} = this.viewport.$root;
        const {left, top} = offset(this.viewport.$root);

        let x = pageX - left;
        x = x < 0 ? 0 : x > offsetWidth ? offsetWidth : x;
        
        let y = pageY - top;
        y = y < 0 ? 0 : y > offsetHeight ? offsetHeight : y;

        return [x, y];
    }


    lineTemplate(){
        let div = document.createElement("div");
        div.innerHTML = `<div class="clip line">
                            <input type="checkbox" class="merge-check">
                            <div class="view-line">
                                <div class="left"></div>
                                <div class="center"></div>
                                <div class="right"></div>
                            </div>
                        </div>`;
        div.querySelector(".left").addEventListener("mousedown", () => this.lineCopied = {target: "left", fw: this.$viewLine.offsetWidth, fx: this.$viewLine.offsetLeft});
        div.querySelector(".center").addEventListener("mousedown", () => this.lineCopied = {target: "center", fw: this.$viewLine.offsetWidth, fx: this.$viewLine.offsetLeft});
        div.querySelector(".right").addEventListener("mousedown", () => this.lineCopied = {target: "right", fw: this.$viewLine.offsetWidth, fx: this.$viewLine.offsetLeft});
        
        window.addEventListener("mousemove", e => {
            if(e.which !== 1 || this.lineCopied === null) return;

            const {target, fw, fx} = this.lineCopied;
            const [X] = this.takeXY(e);
            const {offsetWidth} = this.$line;
            
            let x, w;
            if(target = "left"){
                x = X;
                w = x - fx;
            }

            this.$viewLine.style.left = x + "px";
            this.$viewLine.style.width = w + "px";

        });

        window.addEventListener("mouseup", () => this.lineCopied = null);

        return div.firstChild;
    }
}