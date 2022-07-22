export const cookie = {
	getCookie(c_name){
		let c_start
		let c_end
		if (document.cookie.length > 0) {
			c_start = document.cookie.indexOf(c_name + "=")
			if (c_start != -1)
			{
				c_start = c_start + c_name.length + 1
				c_end = document.cookie.indexOf(";", c_start)
				if (c_end == -1) c_end = document.cookie.length
				return unescape(document.cookie.substring(c_start, c_end))
			}
		}
		return ""
	},
	setCookie(c_name, value, expiredays) {
		let exdate = new Date()
		exdate.setDate(exdate.getDate() + expiredays)
		document.cookie = c_name + "=" + escape(value) +
		((expiredays == null) ? "": ";expires=" + exdate.toGMTString()) + "; path=" + "/"
	},
	delCookie(name) {
		let exp = new Date();
		exp.setTime(exp.getTime() - 1);
		let cval = this.getCookie(name);
		if (cval != null)
			document.cookie= name + " = "+ cval +";expires="+exp.toGMTString() + "; path=" + "/"
	},
	delAllCookie() {
    let cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i]
			let eqPos = cookie.indexOf('=')
			let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
			document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
		}
	}
}

export default cookie
