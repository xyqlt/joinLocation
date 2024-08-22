// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\tianb\source\vscrepos\js/dts/HelperLib-master/src/index.d.ts"/>

logger.setTitle("joinLocation");
const Config = new JsonConfigFile("./plugins/joinLocation/config/config.json");
const db = new JsonConfigFile("./plugins/joinLocation/data/data.json");
const APIURL = "https://mesh.if.iqiyi.com/aid/ip/info?version=1.1.1&ip=";

function loadConfig() {
  try {
    Config.init("Language", "zh_CN");
    Config.init("RegisterePAPI", 1);
    Config.init("ShowToast", 1);
    Config.init("ShowChat", 1);
    Config.init("CacheIpInfo", 1);
    Config.init("enableRegCommand", 1);
    Config.init("Command", "location");

    logger.info("配置文件加载成功");
    return true;
  } catch (e) {
    logger.error("配置文件初始化或加载失败：" + e.message);
    return false;
  }
}

function loadi18n() {
  try {
    i18n.load(
      `plugins/joinLocation/config/i18n/${Config.get("Language")}.json`,
      "",
      {
        zh_CN: {
          "toast.title": "§e{}加入了服务器~",
          "toast.content":
            "§e欢迎来自 §c{}§b{}§g{}§5{}{}§7({}) §e的§4{}§e玩家§a {} §e 加入服务器~",
          "chat.content":
            "§e欢迎来自 §c{}§b{}§g{}§5{}{}§7({}) §e的§4{}§e玩家§a {} §e 加入服务器~",
          "command.help": "查询ip归属地",
          "command.openguimsg": "§e正在打开{}界面",
          "command.ipgui.diy": "自定义查询",
          "command.ipgui.error": "§c参数错误",
          "command.ipgui.name": "§e查询IP信息",
          "command.console.error": "§c控制台无法执行此命令",
          "command.query.notconsole": "只有控制台可以执行此命令",
          "command.ipgui.dropdown": "选择玩家",
          "command.configgui.name": "§e设置",
          "command.query.success": "§a查询成功",
          "command.ipgui.cancel": "§c查询取消",
          "command.configgui.cancel": "§c设置取消",
          "command.configgui.save":
            "§a设置保存，请重启服务器或使用ll reload joinLocation命令以生效配置",
          "command.configgui.language": "语言",
          "command.configgui.registerpapi": "注册PAPI",
          "command.configgui.showtoast": "显示Toast提示",
          "command.configgui.showchat": "显示聊天提示",
          "command.configgui.enableregcommand": "注册指令",
          "command.configgui.command": "指令名称",
          "command.configgui.cacheipinfo": "缓存IP信息",
          "command.query.error": "§c你输入的真的是个IP吗？",
          "command.ipgui.cache": "使用缓存数据查询(只能查询现有玩家)",
          "command.query.output": "§a查询结果：{}{}{}{}{}({})",
          "command.ipgui.content": "§e请输入要查询的IP地址",
          "device.Android": "安卓设备",
          "device.iOS": "苹果设备",
          "device.OSX": "macOS设备",
          "device.Amazon": "亚马逊设备",
          "device.GearVR": "三星GearVR",
          "device.Hololens": "微软HoloLens",
          "device.Windows10": "Windows",
          "device.Win32": "Windows",
          "device.UWP": "Windows",
          "device.windows": "Windows",
          "device.PlayStation": "PlayStation主机",
          "device.Nintendo": "任天堂Switch",
          "device.Xbox": "Xbox主机",
          "device.TVOS": "苹果tvOS",
          "device.default": "未知设备",
        },
      }
    );
    logger.info("语言文件加载成功");

    return true;
  } catch (e) {
    logger.error("加载语言文件失败: " + e.message);
    return false;
  }
}

function RegisterPAPI() {
  try {
    const {
      PAPI,
    } = require("./GMLIB-LegacyRemoteCallApi/lib/BEPlaceholderAPI-JS");
    PAPI.registerPlayerPlaceholder(
      getPlayerCountry,
      "joinLocation",
      "pl_country"
    );
    PAPI.registerPlayerPlaceholder(
      getPlayerProvince,
      "joinLocation",
      "pl_province"
    );
    PAPI.registerPlayerPlaceholder(getPlayerCity, "joinLocation", "pl_city");
    PAPI.registerPlayerPlaceholder(
      getPlayerCounty,
      "joinLocation",
      "pl_county"
    );
    PAPI.registerPlayerPlaceholder(getPlayerISP, "joinLocation", "pl_isp");
    logger.info("PAPI功能已注册");
  } catch (e) {
    logger.error("PAPI注册失败：" + e.message);
    Config.set("RegisterPAPI", 0);
  }
}
function splitString(str, separator) {
  let result = [];
  let startIndex = 0;
  let endIndex = str.indexOf(separator);
  while (endIndex !== -1) {
    result.push(str.substring(startIndex, endIndex));
    startIndex = endIndex + separator.length;
    endIndex = str.indexOf(separator, startIndex);
  }
  result.push(str.substring(startIndex));
  return result;
}
async function cacheInfo(ip, pl) {
  const url = APIURL + ip;
  network.httpGet(url, (code, res) => {
    if (code !== 200) reject(new Error("网络请求错误"));
    let data = JSON.parse(res);
    let ipinfo = [];
    if (data.code === "0" && data.msg === "success") {
      ipinfo.push(data.data.countryCN);
      ipinfo.push(data.data.provinceCN);
      ipinfo.push(data.data.cityCN);
      ipinfo.push(data.data.countyCN);
      ipinfo.push(data.data.townCN);
      ipinfo.push(data.data.ispCN);
      for (let key = 0; key < ipinfo.length; key++) {
        if (ipinfo[key] === "*") {
          ipinfo[key] = "";
        } else if (key < 4) {
          ipinfo[key] = " " + ipinfo[key];
        }
      }
      if (ipinfo[5] === "局域网") {
        ipinfo[4] = "局域网";
      }
      db.set(pl.uuid, {
        ip: splitString(pl.getDevice().ip, ":")[0],
        device: getPlayerDevice(pl),
        ipinfo,
      });
    } else {
      logger.error("获取IP信息失败");
    }
  });
}
function sendMessage(pl, ip, cache = true) {
  const url = APIURL + ip;
  if (cache) {
    let ipinfo = db.get(pl.uuid).ipinfo;
    if (Config.get("ShowToast")) {
      let onlinePlayers = mc.getOnlinePlayers();
      for (let i = 0; onlinePlayers[i] != null; i++) {
        onlinePlayers[i].sendToast(
          i18n.tr("toast.title", pl.realName),
          i18n.tr(
            "toast.content",
            ipinfo[0],
            ipinfo[1],
            ipinfo[2],
            ipinfo[3],
            ipinfo[4],
            ipinfo[5],
            getPlayerDevice(pl),
            pl.realName
          )
        );
      }
    }
    if (Config.get("ShowChat")) {
      mc.broadcast(
        i18n.tr(
          "chat.content",
          ipinfo[0],
          ipinfo[1],
          ipinfo[2],
          ipinfo[3],
          ipinfo[4],
          ipinfo[5],
          getPlayerDevice(pl),
          pl.realName
        )
      );
    }
  } else {
    network.httpGet(url, (code, res) => {
      if (code !== 200) {
        logger.error("网络请求错误");
        return;
      }
      let data = JSON.parse(res);
      let ipinfo = [];
      if (data.code === "0" && data.msg === "success") {
        ipinfo.push(data.data.countryCN);
        ipinfo.push(data.data.provinceCN);
        ipinfo.push(data.data.cityCN);
        ipinfo.push(data.data.countyCN);
        ipinfo.push(data.data.townCN);
        ipinfo.push(data.data.ispCN);
        for (let key = 0; key < ipinfo.length; key++) {
          if (ipinfo[key] === "*") {
            ipinfo[key] = "";
          } else if (key < 4) {
            ipinfo[key] = " " + ipinfo[key];
          }
        }
        if (ipinfo[5] === "局域网") {
          ipinfo[4] = "局域网";
        }
        if (Config.get("ShowToast")) {
          let onlinePlayers = mc.getOnlinePlayers();
          for (let i = 0; onlinePlayers[i] != null; i++) {
            onlinePlayers[i].sendToast(
              i18n.tr("toast.title", pl.realName),
              i18n.tr(
                "toast.content",
                ipinfo[0],
                ipinfo[1],
                ipinfo[2],
                ipinfo[3],
                ipinfo[4],
                ipinfo[5],
                getPlayerDevice(pl),
                pl.realName
              )
            );
          }
        }
        if (Config.get("ShowChat")) {
          mc.broadcast(
            i18n.tr(
              "chat.content",
              ipinfo[0],
              ipinfo[1],
              ipinfo[2],
              ipinfo[3],
              ipinfo[4],
              ipinfo[5],
              getPlayerDevice(pl),
              pl.realName
            )
          );
        }
      } else {
        logger.error("获取IP信息失败");
      }
    });
  }
}
function isStartWithSpace(str) {
  return str.charAt(0) === " ";
}
function getPlayerInfo(uuid, id) {
  let ipinfo = db.get(uuid).ipinfo;
  if (!ipinfo[id]) {
    return "未知";
  } else if (isStartWithSpace(ipinfo[id])) {
    return ipinfo[id].substring(1);
  } else {
    return ipinfo[id];
  }
}
function getPlayerCountry(pl) {
  return getPlayerInfo(pl.uuid, 0);
}
function getPlayerProvince(pl) {
  return getPlayerInfo(pl.uuid, 1);
}
function getPlayerCity(pl) {
  return getPlayerInfo(pl.uuid, 2);
}
function getPlayerCounty(pl) {
  if (getPlayerInfo(pl.uuid, 3) === "未知") {
    return getPlayerInfo(pl.uuid, 4);
  } else {
    return getPlayerInfo(pl.uuid, 3);
  }
}
function getPlayerISP(pl) {
  return getPlayerInfo(pl.uuid, 5);
}
function isIP(str) {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(
    str
  );
}
function getPlayerDevice(pl) {
  if (
    i18n.get("device." + pl.getDevice().os) ===
    "device." + pl.getDevice().os
  ) {
    return i18n.get("device.default");
  }
  return i18n.get("device." + pl.getDevice().os);
}
function sendConfigForm(pl) {
  let fm = mc.newCustomForm();
  fm.setTitle(i18n.get("command.configgui.name"));
  fm.addInput(i18n.get("command.configgui.language"), Config.get("Language"));
  fm.addInput(i18n.get("command.configgui.command"), Config.get("Command"));
  fm.addSwitch(
    i18n.get("command.configgui.registerpapi"),
    Config.get("RegisterPAPI")
  );
  fm.addSwitch(
    i18n.get("command.configgui.showtoast"),
    Config.get("ShowToast")
  );
  fm.addSwitch(i18n.get("command.configgui.showchat"), Config.get("ShowChat"));
  fm.addSwitch(
    i18n.get("command.configgui.enableregcommand"),
    Config.get("enableRegCommand")
  );
  fm.addSwitch(
    i18n.get("command.configgui.cacheipinfo"),
    Config.get("CacheIpInfo")
  );
  pl.sendForm(fm, (player, id) => {
    if (id === null) {
      player.tell(i18n.get("command.configgui.cancel"));
      return;
    }
    try {
      Config.set("Language", id[0]);
      Config.set("Command", id[1]);
      Config.set("RegisterPAPI", id[2]);
      Config.set("ShowToast", id[3]);
      Config.set("ShowChat", id[4]);
      Config.set("enableRegCommand", id[5]);
      Config.set("CacheIpInfo", id[6]);
      player.tell(i18n.get("command.configgui.save"));
    } catch (e) {
      player.tell(i18n.get("command.configgui.error") + ":" + e.message);
    }
  });
}
function sendQueryForm(player) {
  let fm = mc.newCustomForm();
  fm.setTitle(i18n.get("command.ipgui.name"));
  let players = mc.getOnlinePlayers().map((p) => p.realName);
  fm.addDropdown(i18n.get("command.ipgui.dropdown"), players);
  fm.addInput(i18n.get("command.ipgui.content"), "text");
  fm.addSwitch(i18n.get("command.ipgui.cache"), true);
  fm.addSwitch(i18n.get("command.ipgui.diy"), false);
  player.sendForm(fm, (player, id) => {
    if (id === null) {
      player.tell(i18n.get("command.ipgui.cancel"));
      return;
    }
    let pl = mc.getPlayer(players[id[0]]);
    if (id[1] && id[3] && !id[2]) {
      const url = APIURL + id[1];
      network.httpGet(url, (code, res) => {
        if (code !== 200) {
          logger.error("网络请求错误");
          return;
        }
        let data = JSON.parse(res);
        let ipinfo = [];
        if (data.code === "0" && data.msg === "success") {
          ipinfo.push(data.data.countryCN);
          ipinfo.push(data.data.provinceCN);
          ipinfo.push(data.data.cityCN);
          ipinfo.push(data.data.countyCN);
          ipinfo.push(data.data.townCN);
          ipinfo.push(data.data.ispCN);
          for (let key = 0; key < ipinfo.length; key++) {
            if (ipinfo[key] === "*") {
              ipinfo[key] = "";
            } else if (key < 4) {
              ipinfo[key] = " " + ipinfo[key];
            }
          }
          if (ipinfo[5] === "局域网") {
            ipinfo[4] = "局域网";
          }
          let msg = i18n.tr(
            "command.query.output",
            ipinfo[0],
            ipinfo[1],
            ipinfo[2],
            ipinfo[3],
            ipinfo[4],
            ipinfo[5]
          );
          player.tell(msg);
          return true;
        }
      });
    } else if (!id[3] && id[2]) {
      let uuid = pl.uuid;
      let ipinfo = db.get(uuid).ipinfo;
      let msg = i18n.tr(
        "command.query.output",
        ipinfo[0],
        ipinfo[1],
        ipinfo[2],
        ipinfo[3],
        ipinfo[4],
        ipinfo[5]
      );
      player.tell(msg);
      return true;
    } else if (!id[3] && !id[2]) {
      const url = APIURL + splitString(pl.getDevice().ip, ":")[0];
      network.httpGet(url, (code, res) => {
        if (code !== 200) {
          logger.error("网络请求错误");
          return;
        }
        let data = JSON.parse(res);
        let ipinfo = [];
        if (data.code === "0" && data.msg === "success") {
          ipinfo.push(data.data.countryCN);
          ipinfo.push(data.data.provinceCN);
          ipinfo.push(data.data.cityCN);
          ipinfo.push(data.data.countyCN);
          ipinfo.push(data.data.townCN);
          ipinfo.push(data.data.ispCN);
          for (let key = 0; key < ipinfo.length; key++) {
            if (ipinfo[key] === "*") {
              ipinfo[key] = "";
            } else if (key < 4) {
              ipinfo[key] = " " + ipinfo[key];
            }
          }
          if (ipinfo[5] === "局域网") {
            ipinfo[4] = "局域网";
          }
          let msg = i18n.tr(
            "command.query.output",
            ipinfo[0],
            ipinfo[1],
            ipinfo[2],
            ipinfo[3],
            ipinfo[4],
            ipinfo[5]
          );
          player.tell(msg);
          return true;
        } else {
          player.tell(i18n.get("command.ipgui.error"));
          return true;
        }
      });
    }
  });
}
function Regcommand() {
  const cmd = mc.newCommand(
    Config.get("Command"),
    i18n.get("command.help"),
    PermType.GameMasters
  );
  cmd.setEnum("queryAction", ["query"]);
  cmd.setEnum("GuiAction", ["gui", "config"]);
  cmd.mandatory("action", ParamType.Enum, "queryAction", 1);
  cmd.mandatory("action", ParamType.Enum, "GuiAction", 1);
  cmd.mandatory("ip", ParamType.String);
  cmd.overload(["queryAction", "ip"]);
  cmd.overload(["GuiAction"]);
  cmd.setCallback(function (cmd, ori, out, res) {
    switch (res.action) {
      case "gui":
        if (ori.type == 7) {
          logger.error(i18n.get("command.console.error"));
          return false;
        }
        ori.player.sendText(
          i18n.tr("command.openguimsg", i18n.get("command.ipgui.name"))
        );
        sendQueryForm(ori.player);
        return true;
      case "config":
        if (ori.type == 7) {
          logger.error(i18n.get("command.console.error"));
          return false;
        }
        ori.player.sendText(
          i18n.tr("command.openguimsg", i18n.get("command.configgui.name"))
        );
        sendConfigForm(ori.player);
        return true;
      case "query":
        if (ori.type != 7) {
          return out.error(i18n.get("command.query.notconsole"));
        }
        let msg = "";
        if (isIP(res.ip)) {
          const url = APIURL + res.ip;
          network.httpGet(url, (code, res) => {
            if (code !== 200) {
              logger.error("网络请求错误");
              return;
            }
            let data = JSON.parse(res);
            let ipinfo = [];
            if (data.code === "0" && data.msg === "success") {
              ipinfo.push(data.data.countryCN);
              ipinfo.push(data.data.provinceCN);
              ipinfo.push(data.data.cityCN);
              ipinfo.push(data.data.countyCN);
              ipinfo.push(data.data.townCN);
              ipinfo.push(data.data.ispCN);
              for (let key in ipinfo) {
                if (ipinfo[key] === "*") {
                  ipinfo[key] = "";
                }
              }

              msg = i18n.tr(
                "command.query.output",
                ipinfo[0],
                ipinfo[1],
                ipinfo[2],
                ipinfo[3],
                ipinfo[4],
                ipinfo[5]
              );
              logger.info(msg);
              return out.success(msg);
            }
          });
          return out.success(msg);
        } else {
          return out.error(i18n.get("command.query.error"));
        }
    }
  });
  cmd.setup();
}
mc.listen("onServerStarted", () => {
  if (Config.get("RegisterPAPI") && !Config.get("CacheIpInfo")) {
    logger.warn("PAPI功能将无法使用，请在配置文件中开启CacheIpInfo选项。");
  } else if (Config.get("RegisterPAPI") && Config.get("CacheIpInfo")) {
    logger.warn("PAPI功能已启用，正在注册...");
    RegisterPAPI();
  }
  if (Config.get("enableRegCommand")) {
    Regcommand();
  }
});
mc.listen("onJoin", (pl) => {
  if (pl.isSimulatedPlayer()) {
    logger.warn("模拟玩家不显示ip归属地");
    return;
  }
  let ip = splitString(pl.getDevice().ip, ":")[0];
  if (Config.get("CacheIpInfo")) {
    if (!db.get(pl.uuid)) {
      logger.warn(`玩家${pl.realName}没有IP信息缓存，正在获取...`);
      sendMessage(pl, ip, false);
      cacheInfo(ip, pl);
    } else if (db.get(pl.uuid).ip !== ip) {
      logger.warn(`玩家${pl.realName}IP改变，正在更新...`);
      sendMessage(pl, ip, false);
      cacheInfo(ip, pl);
    } else if (db.get(pl.uuid).device !== getPlayerDevice(pl)) {
      logger.warn(`玩家${pl.realName}设备改变，正在更新...`);
      let obj = db.get(pl.uuid);
      obj.device = getPlayerDevice(pl);
      db.set(pl.uuid, obj);
      sendMessage(pl, ip);
    }
  } else {
    sendMessage(pl, ip, false);
  }
});
logger.info("欢迎使用joinLocation插件 作者：xyqlt");
loadConfig();
loadi18n();