const Discord = require('discord.js');
const fs = require('fs');
const uuid = require('uuid');

if(!fs.existsSync('./setting.json')) {
    console.log("setting.json을 찾을 수 없습니다.");
    process.exit(0);
}

const setting = require('./setting.json');

const client = new Discord.Client();

client.on('ready', () => {
    console.log("봇이 구동중입니다!");
    console.log("\n로그인 정보");
    console.log(`봇 이름 : ${client.user.username}`);
    console.log(`봇 ID : ${client.user.id}`);
});

client.on('message', (message) => {
    if(message.content == "=test") {
        if(setting.TESTMODE && setting.TESTER.indexOf(message.author.id) == -1) {
            message.channel.send("권한이 없습니다.");
            return;
        }

        if(!message.guild) {
            message.channel.send("DM에서는 사용할 수 없는 명령어입니다.");
            return;
        }

        let list = {};
        message.guild.channels.cache.forEach((channel) => {
            if(channel.type == "text") {
                try {
                    if (!list[channel.parent.name]) {
                        list[channel.parent.name] = [];
                    }
                    list[channel.parent.name].push(channel.name);
                } catch (error) {
                    if(!list['nocategory']) {
                        list.nocategory = [];
                    }
                    list['nocategory'].push(channel.name);
                }
            }
        });
        message.channel.send(JSON.stringify(list));
        return;
    }

    if(message.content == "=save") {
        if(setting.TESTMODE && setting.TESTER.indexOf(message.author.id) == -1) {
            message.channel.send("권한이 없습니다.");
            return;
        }

        if(!message.guild) {
            message.channel.send("DM에서는 사용할 수 없는 명령어입니다.");
            return;
        }

        let backup_list = JSON.parse(fs.readFileSync('./data/user/backup-list.json'));

        if(backup_list[message.author.id] != null && backup_list[message.author.id].length >= setting.MAX_BACKUP) {
            message.channel.send(`최대 백업 저장 갯수를 초과했습니다.\n봇 관리자가 백업을 최대 ${setting.MAX_BACKUP}개까지 저장할 수 있도록 설정했습니다.`);
            return;
        }

        let backupid = uuid.v4();
        let backup_channel = message.guild.channels;
        backup_channel.cache.forEach((channel) => {
            if(channel.parentID != null) {
                channel.parentName = client.channels.cache.get(channel.parentID).name;
            }
        });
        fs.writeFileSync(`./backup/channel/${message.author.id}-${backupid}.json`, JSON.stringify(backup_channel));

        if(backup_list[message.author.id] == null) {
            backup_list[message.author.id] = [];
        }
        backup_list[message.author.id].push(backupid);
        fs.writeFileSync('./data/user/backup-list.json', JSON.stringify(backup_list));

        message.channel.send(`백업이 완료되었습니다. 확인해보세요.\n백업 이름 : ${backupid}\n=load ${backupid}로 불러올 수 있습니다.`);
        return;
    }

    if(message.content.startsWith("=load")) {
        let params = message.content.replace("=load ", "").split(" ");

        if(setting.TESTMODE && setting.TESTER.indexOf(message.author.id) == -1) {
            message.channel.send("권한이 없습니다.");
            return;
        }

        if(!message.guild) {
            message.channel.send("DM에서는 사용할 수 없는 명령어입니다.");
            return;
        }

        if(!message.member.hasPermission("ADMINISTRATOR")) {
            message.channel.send(`권한이 없습니다.\n서버에서 "관리자" 권한을 가지고 있어야 합니다.`);
            return;
        }

        if(message.content == "=load") {
            message.channel.send("불러올 서버 백업 이름을 입력해야 합니다!");
            return;
        }

        if(!fs.existsSync(`./backup/channel/${message.author.id}-${params[0]}.json`)) {
            message.channel.send("해당 백업은 존재하지 않습니다.");
            return;
        }

        message.guild.channels.cache.forEach((channel) => {
            channel.delete("Load backup by admin.");
        });

        let backup = JSON.parse(fs.readFileSync(`./backup/channel/${message.author.id}-${params[0]}.json`)).cache;
        backup.forEach((channel) => {
            created = message.guild.channels.create(channel.name, channel)
                .then((created) => {
                    if (channel.parentName != null) {
                        let category = message.guild.channels.cache.find(c => c.name == channel.parentName && c.type == "category");
                        created.setParent(category.id);
                    }
                })
                .catch((error) => {
                    channel.permissionOverwrites = [];
                    created = message.guild.channels.create(channel.name, channel)
                        .then((created) => {
                            if (channel.parentName != null) {
                                let category = message.guild.channels.cache.find(c => c.name == channel.parentName && c.type == "category");
                                created.setParent(category.id);
                            }
                        });
                }
                );
        });

        message.channel.send(`${params[0]} 백업을 불러왔습니다.`);
        return;
    }

    if(message.content == "=list") {
        if(setting.TESTMODE && setting.TESTER.indexOf(message.author.id) == -1) {
            message.channel.send("권한이 없습니다.");
            return;
        }

        let backup_list = JSON.parse(fs.readFileSync('./data/user/backup-list.json'));

        if(backup_list[message.author.id] == null || backup_list[message.author.id] == []) {
            message.channel.send("저장한 백업이 없습니다.");
            return;
        }

        message.channel.send(backup_list[message.author.id].join('\n'));
    }

    if(message.content == "=removeallbackup") {
        if(setting.TESTMODE && setting.TESTER.indexOf(message.author.id) == -1) {
            message.channel.send("권한이 없습니다.");
            return;
        }

        let backup_list = JSON.parse(fs.readFileSync('./data/user/backup-list.json'));
        backup_list[message.author.id] = [];
        fs.writeFileSync('./data/user/backup-list.json', JSON.stringify(backup_list));

        fs.readdirSync('./backup/channel').forEach((filename) => {
            if(filename.startsWith(`${message.author.id}-`)) {
                fs.unlinkSync(`./backup/channel/${filename}`);
            }
        });

        message.channel.send("당신의 모든 백업을 삭제했습니다!");
    }
})

client.login(setting.BOT_TOKEN);