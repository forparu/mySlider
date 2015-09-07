function slider(elm) {
    this.container = elm.container;
    this.list = elm.list;
    this.buttons = elm.buttons;
    this.img = this.list.children();

    this.init();
    this.bindDOM();
}

slider.prototype.init = function() {
    var html = [];

    //根据屏幕宽度设置容器和图片的宽高
    this.scaleW = $(window).width();

    this.container.width(this.scaleW - 6);
    this.img.width(this.scaleW);
    this.list.width(this.scaleW * (this.img.length));
    this.container.height(this.scaleW - 6);
    this.img.height(this.scaleW);
    this.list.height(this.scaleW);

    //设定初始的索引值
    this.index = 0;

    //画button
    for (var i = 0; i < this.img.length; i++) {
        html += "<span index=" + (i + 1) + "></span>";
    }
    this.buttons.append(html);
    this.button = this.buttons.children();
    this.button.eq(0).addClass('PRRButtonsOn');
}

slider.prototype.bindDOM = function() {
    var self = this;
    var scaleW = self.scaleW;
    var imgArrLength = self.img.length;
    var animate = false;
    var touchEvent = 0;
    self.confirm = false;

    //改变按钮方法
    function showButton() {
        self.button.eq(self.index).addClass('PRRButtonsOn').siblings().removeClass('PRRButtonsOn');
    }

    //获取当前位置transform值
    function getTransform() {
        var str1 = self.list.css("transform");
        str1 = str1.replace("matrix(", "");
        str1 = str1.replace(")", "");
        var arr1 = str1.split(",");
        return arr1[4] * 1;
    };

    //设置滑动距离
    function setTransform(value) {
        self.list.css("-webkit-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("-moz-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("-o-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("transform", "translate3d(" + value + "px,0,0)");
    };

    //设置动画效果
    function setTransition(value) {
        self.list.css("-webkit-transition", "-webkit-transform " + value + "s ease-out");
        self.list.css("-moz-transition", "-moz-transform " + value + "s ease-out");
        self.list.css("-o-transition", "-o-transform " + value + "s ease-out");
        self.list.css("transition", "transform " + value + "s ease-out");
    }

    //滑动主事件
    function sliderAnimate(Trf, act) {
        animate = true;
        setTransition(0.3);
        if (act == 0) {
            setTransform(Trf);
            animate = false;
        };
        if (act == 1) {

            //左翻
            setTransform(Trf + scaleW);
            self.index -= 1;
            showButton();
        };
        if (act == -1) {

            //右翻
            setTransform(Trf - scaleW);
            self.index += 1;
            showButton();
        };
    }
    //手指按下的处理事件
    var startEvent = function(evt) {
        if (!animate) {
            touchEvent = 0;

            //记录刚刚开始按下的时间
            self.startTime = new Date() * 1;

            //记录手指按下的坐标
            self.startX = evt.originalEvent.touches[0].pageX;

            //记录当前的容器transform值
            self.startTrf = -self.index * scaleW;

            //清除偏移量
            self.offsetX = 0;
        } else {
            return;
        }


    };

    //手指移动的处理事件
    var moveEvent = function(evt) {
        self.container.unbind('touchstart');

        //清除默认事件
        evt.originalEvent.preventDefault();

        //计算手指的偏移量
        self.offsetX = evt.originalEvent.targetTouches[0].pageX - self.startX;

        if (!animate && touchEvent == 0) {
            //滑动效果
            setTransition(0);
            var checkM = scaleW * (1 - imgArrLength);
            if ((self.startTrf == 0 && self.offsetX > 0) || (self.startTrf == checkM && self.offsetX < 0)) {
                setTransform(self.startTrf + (self.offsetX / 3));
                self.confirm = true;
            } else {
                setTransform(self.startTrf + self.offsetX);
                self.confirm = false;
            }

        } else {
            touchEvent++;
        }
    };

    //手指离开的处理事件
    var endEvent = function(evt) {
        self.container.bind('touchstart', startEvent);

        evt.originalEvent.preventDefault();

        //边界就翻页值
        var boundary = scaleW / 6;

        //手指抬起的时间值
        var endTime = new Date() * 1;

        if (!animate && touchEvent == 0) {
            //手指移动时间超过300ms时，按位移计算
            if (!self.confirm) {
                if (endTime - self.startTime > 300) {
                    if (self.offsetX >= boundary) {

                        //左翻
                        sliderAnimate(self.startTrf, 1);
                    } else if (self.offsetX < 0 && self.offsetX < -boundary) {

                        //右翻
                        sliderAnimate(self.startTrf, -1);
                    } else {

                        //不动
                        sliderAnimate(self.startTrf, 0);
                    }
                } else {

                    //快速移动也能使得翻页
                    if (self.offsetX > 50) {

                        //左翻
                        sliderAnimate(self.startTrf, 1);
                    } else if (self.offsetX < -50) {

                        //右翻
                        sliderAnimate(self.startTrf, -1);
                    } else {

                        //不动
                        sliderAnimate(self.startTrf, 0);
                    }
                }
            } else {
                sliderAnimate(self.startTrf, 0);
            }

        } else {
            return;
        }
    };

    //绑定事件
    self.container.bind({
        'touchstart': startEvent,
        'touchmove': moveEvent,
        'touchend': endEvent
    });

    //监听动画结束
    self.list.on('transitionend webkitTransitionEnd', function() {
        animate = false;
    })
};

function carousel(elm) {
    this.container = elm.container;
    this.list = elm.list;
    this.img = this.list.children();
    this.buttons = elm.buttons;
    this.aTime = elm.animateTime;
    this.interval = elm.interval;

    this.init();
    this.bindEvent();
}
carousel.prototype.init = function() {
    var html = [];

    //根据屏幕宽度设置容器和图片的宽高
    this.scaleW = $(window).width();
    this.container.width(this.scaleW - 6);
    this.img.width(this.scaleW);
    this.list.width(this.scaleW * (this.img.length));

    //设定初始的索引值
    this.index = 0;

    //画button
    for (var i = 0; i < this.img.length - 2; i++) {
        html += "<span index=" + i + "></span>";
    }
    this.buttons.append(html);
    this.button = this.buttons.children();
    this.button.eq(0).addClass('PRRButtonsOn');

    //画按钮
    this.buttons.after("<a href='javascript:;' class='arrow prev'>&lt;</a><a href='javascript:;' class='arrow next'>&gt;</a>");

}
carousel.prototype.bindEvent = function() {
    var self = this;
    var scaleW = self.scaleW;
    var imgArrLength = self.img.length;
    var prev = $('.prev');
    var next = $('.next');
    var animate = false,
        turn = 0;
    autoRun();

    //设定初始位置
    setTransform(-scaleW);

    //改变按钮方法
    function showButton() {
        self.button.eq(self.index).addClass('PRRButtonsOn').siblings().removeClass('PRRButtonsOn');
    }

    //获取当前位置transform值
    function getTransform() {
        var str1 = self.list.css("transform");
        str1 = str1.replace("matrix(", "");
        str1 = str1.replace(")", "");
        var arr1 = str1.split(",");
        return arr1[4] * 1;
    };

    //设置滑动距离
    function setTransform(value) {
        self.list.css("-webkit-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("-moz-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("-o-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("transform", "translate3d(" + value + "px,0,0)");
    };

    //设置动画效果
    function setTransition(value) {
        self.list.css("-webkit-transition", "-webkit-transform " + value + "s ease-out");
        self.list.css("-moz-transition", "-moz-transform " + value + "s ease-out");
        self.list.css("-o-transition", "-o-transform " + value + "s ease-out");
        self.list.css("transition", "transform " + value + "s ease-out");
    }

    //滑动主事件
    function sliderAnimate(Trf, act) {

        animate = true;
        setTransition(self.aTime);
        if (act == 1) {

            //左翻
            setTransform(Trf + scaleW);
            if (self.index == 0) {
                self.index = imgArrLength - 3;
                turn = -1;
            } else {
                self.index -= 1;
                turn = 0;
            }
            showButton();
        };
        if (act == -1) {

            //右翻
            setTransform(Trf - scaleW);
            if (self.index == imgArrLength - 3) {
                self.index = 0;
                turn = 1;
            } else {
                self.index += 1;
                turn = 0;
            }
            showButton();
        };
    }

    prev.on('click', function() {
        if (!animate) {

            //获取当前的容器transform值
            self.startTrf = -(self.index + 1) * scaleW;

            sliderAnimate(self.startTrf, 1);
        } else {
            return;
        }
    });

    next.on('click', function() {
        if (!animate) {

            //获取当前容器transform值
            self.startTrf = -(self.index + 1) * scaleW;

            sliderAnimate(self.startTrf, -1);
        } else {
            return;
        }
    });


    self.button.each(function() {
        $(this).bind('click', function() {
            console.log(1);
            if ($(this).attr('class') == 'PRRButtonsOn') {
                return;
            }
            var myIndex = parseInt($(this).attr('index'));
            var offset = -scaleW * (myIndex + 1); //图片应该移动的距离
            setTransition(self.aTime);
            setTransform(offset);
            self.index = myIndex;
            showButton();
        })
    })

    //自动播放
    function autoRun() {
        timer = setTimeout(function() {
            next.trigger('click');
            autoRun();
        }, self.interval);
    }

    function stopAuto() {
        clearTimeout(timer);
    }

    self.container.hover(stopAuto, autoRun);

    //监听动画结束
    self.list.on('transitionend webkitTransitionEnd', function() {

        var value = scaleW * (imgArrLength - 3);
        animate = false;
        setTransition(0);
        if (turn == -1) {
            setTransform(self.startTrf - value);
        };
        if (turn == 1) {
            setTransform(self.startTrf + value);
        };
    });
}
