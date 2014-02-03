/* auther{邝其毅}
 * createDate{2012年端午节}
 * 通用验证控件
 * */
!function($){
    $.fn.extend({
        extData:function(key,obj){ //扩展Dom节点上绑定的数据
            var dd = this.data(key);
            if(dd){
                this.data(key,$.extend({},dd,obj));
            }else{
                this.data(key,obj);
            }
            return this;
        }
    });
    var customValidator = {
        /*
         * 在dom上用$.data绑定key为eValid的数据
         * eValid:{
         *  hasInit:true 已经初始化过
         *  disabled=1,此验证不启用，其他情况启用
         * 	isValid:真则此dom已经通过验证
         * 	message:错误信息文本
         * }
         *
         * 用类gn-inValidate来标记未通过验证的input/textarea
         *
         * 验证初始化参数：
         * eValid=requried：必填，针对于radio,checkbox，只需要设置第一个，准备兼容设备所有项
         * eValid=unique:特有验证，验证时执行$(obj).data("eValid").unique()
         * */
        scrollObj: window,
        scrollObjInit:-12,
        inValidAry:[],
        attrReg:/(\w+)\[?([^\]]*)\]?/,
        combReg:/(\w+)\{?([^\}]*)\}?/,

        init:function(container){
            var valid = this;
            valid.scrollObj = $("#scrollDom,#center-layout").length>0 ? $("#scrollDom,#center-layout") : $(document.body);

            //在checkbox或者radio中，eValid属性加在任意几个 name相同的表单项上都可行，在这里统一修正为第一个
            $("input:checkbox[name][eValid],input:radio[name][eValid]",container).each(function(){
                var obj = this;
                var $obj = $(obj);
                var oriAttr = $obj.attr("eValid");
                if(oriAttr){
                    $("input:" + $obj.attr("type") + "[name='" + obj.name + "']").removeAttr("eValid").first().attr("eValid",oriAttr);
                }
            })

            //几个里面必填一个，为避免过多的循环，调整一下
            $("input[name][eValid^=required1]",container).each(function(){
                var $obj = $(this);
                if(!$obj.data("eValid")){//不能初始化多次
                    var oriAttr = $(this).attr("eValid");
                    if(oriAttr){
                        var mark1 = oriAttr.match(valid.attrReg);
                        if(mark1.length>0){
                            var allobj = $("input[name][eValid^=required1][eValid*="+ mark1[2] +"]").removeAttr("eValid");
                            var allobjf = allobj.first().attr("eValid",oriAttr).extData("eValid",{chkobj:allobj,hasInit:true});
                            allobj.bind("blur.eValid keyup.eValid",function(){
                                valid.validate1(allobjf);
                            });
                        }
                    }
                }
            })

            //有时候easyui的combo系列也会用到此验证，在此进行修正
            $("[eValid][comboName]",container).each(function(){
                var obj = $(this)
                var oriValue = obj.attr("eValid");
                obj.removeAttr("eValid").next("span").find("input.combo-text").attr("eValid",oriValue);;
                //$("[name='" + obj.attr("comboName") +"']",container)
            })

            $("[eValid]",container).each(function(){
                var obj = this;
                var $obj = $(obj);

                var objData = $obj.data("eValid");
                if(objData){
                    return;
                }
                $obj.data("eValid",{});///////////
                if(/(input)|(select)|(textarea)/i.test(obj.tagName)){
                    if($obj.attr("type")== "checkbox" || $obj.attr("type")== "radio"){
                        //单选或者多选特殊处理
                        $("input[name='"+obj.name+"']").bind("click.eValid",function(){
                            valid.validate1(obj);
                        });
                    }else{
                        //其他的（在EasyUI下都是输入框）则一般处理
                        $(this).bind("blur.eValid keyup.eValid",function(){
                            valid.validate1(obj);
                        });
                    }
                }
            });
        },

        validate:function(func,container){
            var valid = this;
            valid.inValidAry = new Array();
            $(".gn-inValidate").removeClass("gn-inValidate");
            $("[eValid]",container).each(function(){
                valid.validate1(this);
            });
            $(".gn-inValidate,.validatebox-invalid").each(function(){
                valid.inValidAry.push(valid.getBoxText(this));
            });
            var iv = $(".gn-inValidate:first",container).focus();
            return iv.length <= 0;
        },

        validate1:function(obj,myAttr){
            var valid = this;
            var $Obj = $(obj);
            var objData = $Obj.data("eValid");
//			if($Obj.height() <= 0){ //元素为不可见状态display:none
//				return true;
//			}

            if(objData){
                if(objData.disabled == "1" || objData.disabled == 1){
                    return true;
                }
            }else{
                valid.init();
            }

            var desc;
            if($.fn.validatebox && $.fn.validatebox.defaults.getTextFromInput){
                desc = $.fn.validatebox.defaults.getTextFromInput(obj);
            }
            if(objData.message){
                desc = objData.message
            }else{
                desc = (desc ? desc +"为" : "")+ "必填项"
            }

            var objAttr = myAttr || $Obj.attr("eValid");
            var objAttrM = objAttr.match(valid.attrReg);
            switch(objAttrM.length > 1 ? objAttrM[1] : objAttr){
                case "combine"://combine：多种验证组合combine{required[xxx]|more[aaa]|ccc[bbb]}
                    objAttrM = objAttr.match(combReg);
                    if(objAttrM[2]){
                        $.each(objAttrM[2].split('|'),function(objIdx,objVal){
                            valid.validate1(obj,objVal);
                        });
                    }
                    break;
                case "required":
                    if(objAttrM[2]){
                        var fobjAttrM = eval(objAttrM[2])
                        if(typeof fobjAttrM=="function" && !fobjAttrM()){
                            break;
                        }
                    }
                    if($Obj.attr("type") == "radio" || $Obj.attr("type") == "checkbox"){
                        //var suitName = this.name.replace('.','\\\\.');
                        if ($("input[name='"+obj.name+"']:checked").length == 0){
                            valid.cmbSet1Error(obj,desc);
                        }else{
                            valid.cmbClr1Error(obj);
                        };
                    }else{
                        if ($Obj.hasClass('combo-text')){
                            if($Obj.parent().find(">input.combo-value").val() == ""){
                                valid.cmbSet1Error(obj,desc);
                            }else{
                                valid.cmbClr1Error(obj);
                            };
                        }else{

                            if($Obj.val() == ""){
                                valid.cmbSet1Error(obj,desc);
                            }else{
                                valid.cmbClr1Error(obj);
                            };
                        }
                    }
                    break;
                case "required1"://多个里面必填一个，形式:required1[key],key相同的表单项必填一个
                    var $Obj1 = {};
                    if(objData.chkobj){
                        $Obj1 = objData.chkobj
                    }else{
                        var sltStr = "[eValid^=required1][eValid*="+ objAttrM[2] +"]";
                        $Obj1 = $(sltStr);
                    }

                    var totalVal = "",totalDesc = [];
                    $Obj1.each(function(idx,rObj){
                        totalDesc.push(valid.getInputDesc(rObj));
                        totalVal += $(rObj).val();
                    })

                    if(totalVal.length<=0){
                        $Obj1.each(function(idx,rObj){
                            valid.cmbSet1Error(obj,totalDesc.join(",")+"必填其中一项");
                        })
                    }else{
                        $Obj1.each(function(idx,rObj){
                            valid.cmbClr1Error(obj);
                        })
                    }
                    break;
                case "unique":
                    $Obj.data("eValid").unique();
                    break;
                default:
                    return true;
            }
        },
        //获得输入框的中文描述，耦合度比较大，考虑去留中
        getInputDesc:function(obj){
            if($.fn.validatebox && $.fn.validatebox.defaults.getTextFromInput){
                return $.fn.validatebox.defaults.getTextFromInput(obj);
            }
        },
        //override it
        getBoxText:function(obj){
            var tip=$(obj);
            if(tip.hasClass("inValidate-tip")){
                return this.getInputDesc(tip.parent().find("input"));
            }

            if(tip.hasClass("validatebox-invalid") || (tip.hasClass("gn-inValidate") && tip.is("input"))){
                //前面个一种情况是easyui的input框，后面的是其他带有eValid属性的出错的ipnut框
                return this.getInputDesc(obj)
            }
        },


        /*
         * 表单的描述跟错误提示信息不一定一样
         * 而且同一个表单可能有两种以上验证
         * 所以错误信息只能在每个错误设置时添加上去
         *
         * @param {Object} obj
         * @param {Object} errMsg
         */
        cmbSet1Error:function(obj,errMsg){
            var data = $(obj).data("eValid");
            if(data){
                data.isValid = false;

                if(!$(obj).hasClass("gn-inValidate")){
                    $(obj).addClass("gn-inValidate");
                }

                var t = $(".inValidate-tip",$(obj).parent());
                if(t.length == 0){
                    if(errMsg){
                        data.message = errMsg;
                    }
                    this.showMsg(obj);
                    this.positionTips();
                }
            }
        },

        cmbClr1Error:function(obj){
            var data = $(obj).data("eValid");
            if(data){
                data.isValid = true;

                if($(obj).hasClass("gn-inValidate")){
                    $(obj).removeClass("gn-inValidate");
                }

                $(".inValidate-tip",$(obj).parent()).remove();
            }
        },

        showMsg:function(obj){ //显示错误信息
            //如果有错误信息，则显示为错误信息，否则显示为“必填项”
            var errMsg = "必填项"
            var eValidData = $(obj).data("eValid");
            if(eValidData && eValidData.message){
                errMsg = eValidData.message
            }

            var l = $(obj).position().left;//$(obj).offset().left;
            var t = $(obj).position().top;//$(obj).offset().top;
            var tip = '<div class="validatebox-tip inValidate-tip" style="position: absolute;"></div>'
            tip = $(tip);
            tip.css("display","block").css("left",l).css("top",t+this.scrollObjInit);
            tip.html('<span class="validatebox-tip-content validatebox-tip-content-move"><span class="validatebox-tip-content-inner">'+errMsg+'</span><span class="validatebox-tip-content-closer">×</span></span>');


            if(tip.draggable){
                tip.draggable( {
                    axis: "v",
                    handle:".validatebox-tip-content-move"
                } );
            }

            tip.find(".validatebox-tip-content-closer").click(function(){
                tip.remove()
            })

            tip.appendTo($(obj).parent());
        },

        positionTips:function(){ //定位错误信息
            var myObj = this;
            this.scrollObj.scroll(function(){
                $(".inValidate-tip").each(function(){
                    $(this).css("top",$(this).parent().position().top+myObj.scrollObjInit);
                })
            })
        },
        clearErrMsg:function(selector){//清空所有错误消息
            $(".gn-inValidate",selector).removeClass("gn-inValidate");
            $(".inValidate-tip",selector).remove();
        },
        changeValidateState:function(state,selector){
            $("[eValid]",selector).each(function(){
                var ipt = $(this);
                if(ipt.data("eValid")){
                    ipt.extData("eValid",{disabled:state});//state=1验证不启用
                }
            });
        },
        clearValidate:function(selector){ //清空所有校验
            this.clearErrMsg(selector);
            $("[eValid]",selector).unbind(".eValid").removeData("eValid");
            if (this.scrollObj && selector == undefined) {
                this.scrollObj.unbind(".eValid");
            }
        },
        removeValidate:function(selector){ //移除所有校验
            this.clearValidate(selector);
            $("[eValid]",selector).removeAttr("eValid");
        }
    }

    $.eValid =  customValidator;
}(jQuery);
