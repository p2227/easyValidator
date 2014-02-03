/*  基于easyui的验证扩展
*   jquery版本1.6,easyui版本 1.2.6
*   开始编写于2011年4月
*   作者p2227
* */
!function($){
    if($.fn.validatebox){
        //此处用于存放验证用的正则表达式对象
        $.fn.validatebox.defaults.dtb = {
            "组织机构代码":/^\w{8}[-]\w$/,
            "邮政编码":/^[1-9]\d{5}$/,
            "手机号码":/^1\d{10}$/,
            "座机号码":/^(\(?0\d{2,3}\)?[- ]?)?\d{7,8}$/,
            "联系电话":/^(1\d{10})|((\(?0\d{2,3}\)?[- ]?)?\d{7,8})$/
        },
        //此处用于存放提取用的正则表达式对象
        $.fn.validatebox.defaults.mtb = {
            "日期":/(\d{4})([-\/.])(\d{1,2})\2(\d{1,2})/
        },

        $.fn.validatebox.defaults.cmpCore = function(v1,v2,relation){
            switch(relation){
                case "大于":
                    return v1>v2
                    break;
                case "大于等于":
                    return v1>=v2
                    break;
                case "小于":
                    return v1<v2
                    break;
                case "小于等于":
                    return v1<=v2
                    break;
                case "不等于":
                    return v1!=v2
                    break;
                default:
                    return v1==v2
                    break;
            }
        },

        //此函数存放的是档案管理系统中的 根据(表单选择器)获取(表单文字描述) 函数
        //在其他系统中按需求重写此函数
        $.fn.validatebox.defaults.getTextFromInput = function(s){
            return $(s).parent().text().replace(/(\:\*$)|(\:$)|(&nbsp;)/g,'');
        },

        $.extend($.fn.validatebox.defaults.rules, {
            compare:{
                //用法 validType="compare[selector,'小于等于']"
                //兼容日期比较和数字比较
                validator:function(value ,param){
                    /*
                     * 参数1,value：此表单的值
                     * 参数2：param[0],要比较表单的选择器，或者直接赋值例如new Date()
                     * 参数3：param[1],"大于","大于等于","小于","小于等于"或者"等于"(默认)
                     * 参数4：param[2],要比较表单的文字描述,可选值
                     * 返回值为true才通过验证
                     */
                    var regValue = value.match($.fn.validatebox.defaults.mtb["日期"]);
                    var fthis;
                    var ftarget;

                    if(regValue){
                        fthis = (new Date(regValue[1],parseInt(regValue[3],10) - 1 ,regValue[4])).getTime();
                    }else{
                        fthis = parseFloat(value);
                    }

                    switch(typeof(param[0])){
                        case "object":
                            ftarget = param[0].getTime();
                            param[2] = "当前日期";
                            break;

                        case "number":
                            ftarget = param[0];
                            param[2] = param[0];
                            break;

                        case "string":
                            if($(param[0]).hasClass("datebox-f")){
                                ftarget = $(param[0]).datebox("getValue") || $(param[0]).datebox("getText");
                                if(ftarget.length<=0){
                                    param[1] = "先选";
                                    param[2] = $.fn.validatebox.defaults.getTextFromInput(param[0])
                                    return false;
                                }
                                regValue = ftarget.match($.fn.validatebox.defaults.mtb["日期"]);
                                ftarget = (new Date(regValue[1],parseInt(regValue[3],10) - 1 ,regValue[4])).getTime();
                            }else {
                                ftarget =  parseFloat($(param[0]).val());
                            }
                            break;

                        default:
                            return;
                            break;
                    }


                    if(!param[2]){
                        param[2] = $.fn.validatebox.defaults.getTextFromInput(param[0]);
                    }

                    if(isNaN(fthis) || isNaN(ftarget)){
                        return true;
                    }else{
                        return $.fn.validatebox.defaults.cmpCore(fthis,ftarget,param[1])
                    }

                },
                message:"必须{1}{2}"
            },
            format:{
                //用法 validType="format['邮政编码']"
                validator:function(value ,param){
                    /*
                     * 参数1,value：此表单的值
                     * 参数2：param[0],要比较的格式的类型
                     * [邮政编码，手机号码，座机号码，身份证号]
                     * 参数3：param[1],可选，错误信息
                     */
                    var dtb = $.fn.validatebox.defaults.dtb;
                    if(param[1] == undefined){
                        param[1]="请输入正确的" + param[0]
                    }
                    return dtb[param[0]].test(value);
                },
                message:"{1}"
            },
            condFormat:{
                validator:function(value ,param){
                    /*
                     * 参数1,value：此表单的值
                     * 参数2：param[0],条件表达式字符串或者函数，例如'a==b', abc() (传函数名即可)当返回true时才进行验证
                     * 参数3：param[1],要比较的格式的类型
                     * [邮政编码，手机号码，座机号码，身份证号]
                     * 参数4：param[2],可选，错误信息
                     */
                    var v
                    if(typeof(param[0]) == "function"){
                        v = param[0]()
                    }else{
                        v = eval(param[0]);
                    }
                    if(v){
                        var dtb = $.fn.validatebox.defaults.dtb;
                        if(param[2] == undefined){
                            param[2]="请输入正确的" + param[1]
                        }
                        return dtb[param[1]].test(value);
                    }else{
                        return true;
                    }

                },
                message:"{2}"
            },
            idCard:{
                validator:function(value ,param){

                    if(param){
                        if(typeof(param[0]) == "function"){
                            var val = param[0]()
                            if(!val)
                                return true;
                        }
                    }

                    var idcard=value;
                    var cities = {
                        11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",
                        21:"辽宁",22:"吉林",23:"黑龙江",
                        31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",
                        41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",
                        50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",
                        61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",
                        71:"台湾",
                        81:"香港",82:"澳门",
                        91:"国外"
                    };

                    idcard = idcard.toString();

                    //验证位数是否正确
                    if(!(idcard.length==15 || idcard.length==18)){
                        return false;
                    }

                    var info = idcard.length==15 ?
                        idcard.match(/([1-9]\d)\d{4}(\d{2})(\d{2})(\d{2})\d{2}(\d)/i) :
                        idcard.match(/([1-9]\d)\d{4}(\d{4})(\d{2})(\d{2})\d{2}(\d)[\dx]/i);

                    if (!info.length)
                    {
                        return false;
                    }

                    //验证省份是否正确
                    if (!cities[info[1]])
                    {
                        return false;
                    }

                    //验证生日是否正确
                    var birthday = new Date(info[2], info[3]-1, info[4]);
                    if (! (
                        (birthday.getFullYear()==info[2] || birthday.getYear()==info[2]) &&
                            birthday.getMonth()+1 == parseInt(info[3],10) &&
                            birthday.getDate() == parseInt(info[4], 10)
                        )){
                        return false;
                    }

                    //18位身份证校验
                    if (info[0].length==18)
                    {
                        var sum = 0;
                        info[0] = info[0].replace(/x/i, 'a');
                        for(var i=17; i>=0; i--){
                            sum += (Math.pow(2,i) % 11) * parseInt(info[0].charAt(17-i), 11);
                        }
                        if((sum % 11) != 1){
                            return false;
                        }
                    }

                    return true;
//				{
//					city: cities[info[1]],
//					birthday: birthday,
//					sex: info[5] % 2 ? "男" : "女"
//				};

                },
                message:"请输入合法的大陆居民身份证号"
            },
            sumCompare:{
                //某数值跟 另外几个数值的和 之间进行比较
                validator:function(value ,param){
                    /*
                     * 参数1,value：此表单的值
                     * 参数2：param[0],总和表单的选择器 #sum
                     * 参数3: param[1],关系的文字描述，"大于","大于等于","小于","小于等于"或者"等于"(默认)
                     * 参数3：param[2],错误信息，若要系统自动生成，可传数字0
                     * 参数N：param[3],param[4],...各加数表单的选择器，值可多可少
                     */
                    var sumText = $.fn.validatebox.defaults.getTextFromInput(param[0]);
                    var addendText = [];
                    var addendValue = 0;
                    for(var i=3;i<param.length;i++){
                        addendText.push($.fn.validatebox.defaults.getTextFromInput(param[i]))
                        addendValue += parseFloat($(param[i]).val());
                    }
                    if(!param[2]){
                        param[2] = sumText + "必须" + param[1]+"以下值的和:<br/>";
                        param[2] += addendText.toString();
                    }
                    var fthis = parseFloat($(param[0]).val());
                    var ftarget = parseFloat(addendValue);
                    return $.fn.validatebox.defaults.cmpCore(fthis,ftarget,param[1])
                },
                message:"{2}"
            },
            gridCompare:{
                validator:function(value,param){
                    /*
                     * 参数1,value：此表单的值
                     * 参数2：param[0],要比较的fieldName
                     * 参数3：param[1],整个grid的选择器
                     * 参数4：param[2],"大于","大于等于","小于","小于等于"或者"等于"(默认)
                     * 参数5：param[3],要比较表单的文字描述,可选值
                     * 返回值为true才通过验证
                     */
                    var fieldName = param[0];
                    var grid = param[1];
                    var relation = param[2];
                    if(window.currRowIdx){
                        grid = $(grid);

                        var targetEditor = grid.datagrid("getEditor",{index:window.currRowIdx,field:fieldName});
                        var ftarget = targetEditor.actions.getValue(targetEditor.target);
                        var regValue = value.match($.fn.validatebox.defaults.mtb["日期"]);

                        if(regValue){
                            fthis = (new Date(regValue[1],parseInt(regValue[3],10) - 1 ,regValue[4])).getTime();
                        }else{
                            fthis = parseFloat(value);
                        }
                        switch(targetEditor.type){
                            case "datebox":
                                if(ftarget.length<=0){
                                    param[2] = "先选";
                                    param[3] = grid.datagrid("getColumnOption",fieldName).title;
                                    return false;
                                }
                                regValue = ftarget.match($.fn.validatebox.defaults.mtb["日期"]);
                                ftarget = (new Date(regValue[1],parseInt(regValue[3]) - 1 ,regValue[4])).getTime();
                                break;
                            default:
                                ftarget =  parseFloat(ftarget);
                                break;
                        }

                        if(!param[3]){
                            param[3] = grid.datagrid("getColumnOption",fieldName).title;
                        }

                        return $.fn.validatebox.defaults.cmpCore(fthis,ftarget,relation);
                    }else{
                        return true;
                    }
                },
                message:"必须{2}{3}"
            }

            /*
             * The validate rule is defined by using required and validType property, here are the rules already implemented:

             email: Match email regex rule.
             url: Match URL regex rule.
             length[0,100]: Between x and x characters allowed.
             remote['http://.../action.do','paramName']: Send ajax request to do validate value, return 'true' when successfully.
             另外numberbox中内置关于数字的一些限制/验证
             *
             * */
        });
    }
}(jQuery);
