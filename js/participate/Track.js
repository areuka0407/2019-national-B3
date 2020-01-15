/**
 * 
 */
class Track {
    constructor(app, id){
        this.app = app;
        this.id = id;

        this.$video = document.createElement("video");
        this.$video.src = `videos/movie${id}.mp4`;
        this.$clipList = this.listTemplate();
        this.$cursor = this.$clipList.querySelector("#cursor");
        this.cursorClick = false;

        this.clipList = [];
        this.mouseEvent();
    }

    set width(val){ this.$video.width = val }
    set height(val){ this.$video.height = val }

    // 현재 영상의 시간에 비례하여 커서 위치를 옮긴다.
    updateCursor(){
        const {currentTime, duration, width} = this.$video;
        this.$cursor.style.left = width * currentTime / duration + "px";
    }

    // 클립 리스트에 클립을 새롭게 추가한다.
    addClip(clip){
        this.clipList.push(clip);
        this.$clipList.prepend(clip.$line);
    }

    // 리스트 DOM을 생성한다.
    listTemplate(){
        let div = document.createElement("div");
        div.innerHTML = `<div id="cursor"></div>
                        <div class="line"></div>`;
        return div;
    }

    // 마우스 이벤트를 추가한다.
    mouseEvent(){
        // 커서 조작 이벤트
        this.$cursor.addEventListener("mousedown", e => this.cursorClick = e.which === 1);
        window.addEventListener("mousemove", e => {
            if(e.which !== 1 || !this.cursorClick) return;
            const {left} = offset(this.$clipList);
            const {offsetWidth} = this.$clipList;

            let x = e.pageX - left;
            x = x < 0 ? 0 : x > offsetWidth ? offsetWidth : x;
            this.$cursor.style.left = x + "px"; 
            this.$video.currentTime = this.$video.duration * x / offsetWidth;
        });
        window.addEventListener("mouseup", () => this.cursorClick = false);
    }
}