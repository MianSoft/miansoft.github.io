/*:
 * @plugindesc 游戏根据屏幕分辨率自动扩充全屏
 * @author RM CoreScript team（CHK整合）
 *
 * @help 请把这个插件放到YEP核心插件的下面(如果有的话)
 * 注意：适配手机/电脑分辨率时只变更长度，高度是不变的。
 * 比如你填写720，就是720P分辨率的游戏;填写1080就是1080P分辨率的游戏。MV默认是624
 * (如果你游戏内容已经做的很多了，修改坐标时只改个X轴即可,也就是偷懒)
 * 
 * 【最后唠叨一下(老司机就不用看了)】：
 * 稍微说明一下什么是改X轴吧。。比如你本来一张图片是显示在X轴：640的坐标(实际画面居中的效果)，
 * 分辨率扩充之后，这个就不居中了啊！那就要修改这个图片的X轴啊！
 * 建议萌新所有图片的X轴采用以下格式： 
 * Graphics.width/2 (屏幕宽度÷2就是居中的意思)
 * Graphics.width - 图片的宽度 (就是靠右的意思)
 * 0 (就是靠左的意思)
 *
 * @param 分辨率高度
 * @desc 用于设置游戏的屏幕高度。
 * @default 624
 */
 
(function() {
    function toNumber(str, def) {
        return isNaN(str) ? def : +(str || def);
    }
 
    var parameters = PluginManager.parameters('QuanPing');
    var screenHeight = toNumber(parameters['分辨率高度'], 624);
    var screenWidth = Math.ceil(screen.width/screen.height*screenHeight);
    var windowWidthTo = screenWidth;
    var windowHeightTo = screenHeight;

    var windowWidth;
    var windowHeight;

    if(windowWidthTo){
        windowWidth = windowWidthTo;
    }else if(screenWidth !== SceneManager._screenWidth){
        windowWidth = screenWidth;
    }

    if(windowHeightTo){
        windowHeight = windowHeightTo;
    }else if(screenHeight !== SceneManager._screenHeight){
        windowHeight = screenHeight;
    }


    SceneManager._screenWidth = screenWidth;
    SceneManager._screenHeight = screenHeight;
    SceneManager._boxWidth = screenWidth;
    SceneManager._boxHeight = screenHeight;

    var _SceneManager_initNwjs = SceneManager.initNwjs;
    SceneManager.initNwjs = function() {
        _SceneManager_initNwjs.apply(this, arguments);

        if (Utils.isNwjs() && windowWidth && windowHeight) {
            var dw = windowWidth - window.innerWidth;
            var dh = windowHeight - window.innerHeight;
            window.moveBy(-dw / 2, -dh / 2);
            window.resizeBy(dw, dh);
        }
    };

	//使我方战斗精灵居中 CHK
	var _sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
	Sprite_Actor.prototype.setActorHome = function(index) {
      _sprite_Actor_setActorHome.call(this, index);
      this._homeX += Graphics.boxWidth - 816;
      this._homeY += Graphics.boxHeight - 624;
    };
    Sprite_Actor.prototype.retreat = function() {
    this.startMove(1200, 0, 120);
    };
	//使敌人战斗精灵居中 CHK
    var _sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
    Sprite_Enemy.prototype.setBattler = function(battler) {
      _sprite_Enemy_setBattler.call(this, battler);
      if (!this._enemy._alteredScreenY) {
        this._homeY += Graphics.boxHeight - 624;
        this._enemy._screenY = this._homeY;
        this._enemy._alteredScreenY = true;
      }
      if ($gameSystem.isSideView()) return;
      if (!this._enemy._alteredScreenX) {
        this._homeX += (Graphics.boxWidth - 816) / 2;
        this._enemy._screenX = this._homeX;
        this._enemy._alteredScreenX = true;
      }
    };
	//战斗背景自动拉伸 CHK
    function Sprite_Battleback() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Battleback.prototype = Object.create(Sprite.prototype);
    Sprite_Battleback.prototype.constructor = Sprite_Battleback;

    Sprite_Battleback.prototype.initialize = function(bitmapName, type) {
      Sprite.prototype.initialize.call(this);
      this._bitmapName = bitmapName;
      this._battlebackType = type;
      this.createBitmap();
    };

    Sprite_Battleback.prototype.createBitmap = function() {
      if (this._bitmapName === '') {
        this.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
      } else {
        if (this._battlebackType === 1) {
          this.bitmap = ImageManager.loadBattleback1(this._bitmapName);
        } else {
          this.bitmap = ImageManager.loadBattleback2(this._bitmapName);
        }
        this.scaleSprite();
      }
    };

    Sprite_Battleback.prototype.scaleSprite = function() {
      if (this.bitmap.width <= 0) return setTimeout(this.scaleSprite.bind(this), 5);
      var width = Graphics.boxWidth;
      var height = Graphics.boxHeight;
      if (this.bitmap.width < width) {
        this.scale.x = width / this.bitmap.width;
      }
      if (this.bitmap.height < height) {
        this.scale.y = height / this.bitmap.height;
      }
      this.anchor.x = 0.5;
      this.x = Graphics.boxWidth / 2;
      if ($gameSystem.isSideView()) {
        this.anchor.y = 1;
        this.y = Graphics.boxHeight;
      } else {
        this.anchor.y = 0.5;
        this.y = Graphics.boxHeight / 2;
      }
    };

    Spriteset_Battle.prototype.createBattleback = function() {
      this._back1Sprite = new Sprite_Battleback(this.battleback1Name(), 1);
      this._back2Sprite = new Sprite_Battleback(this.battleback2Name(), 2);
      this._battleField.addChild(this._back1Sprite);
      this._battleField.addChild(this._back2Sprite);
    };
    Spriteset_Battle.prototype.updateBattleback = function() {
    };
})();