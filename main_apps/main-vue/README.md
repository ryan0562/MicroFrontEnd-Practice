1. 跳转到子应用必须要封口 例如：to="/child-vue/" ，不能：to="/child-vue"
2. 子应用name不能使用中文，必须以字母开头，且不可以带有除中划线和下划线外的特殊符号
3. 在微前端的沙箱环境中，顶层变量不会泄漏为全局变量。不允许使用var、function xx () {}
例如在正常情况下，通过 var name 或 function name () {} 定义的顶层变量会泄漏为全局变量，通过window.name或name就可以全局访问。
但是在沙箱环境下这些顶层变量无法泄漏为全局变量，window.name或name为undefined，导致出现问题。
4. 路由类型约束
基座是hash路由，子应用也必须是hash路由
基座是history路由，子应用可以是hash或history路由