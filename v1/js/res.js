var langs = ["en","vi","fr","es","pt"];
var strings = {
	lbl_level: {
		'en': "LEVEL",
		'vi': "CẤP",
		'fr': "NIVEAU",
		'es': "NIVEL",
		'pt': "NÍVEL"
	},
    lbl_lives: {
		'en': "LIFES",
		'vi': "MẠNG",
		'fr': "LA VIES",
		'es': "VIVE",
		'pt': "VIDAS"
	},
	lbl_score: {
		'en': "SCORE",
		'vi': "ĐIỂM",
		'fr': "SCORE",
		'es': "PUNTUACIÓN",
		'pt': "PONTO"
	},
    lbl_highscore: {
        'en': "HIGHSCORE",
        'vi': "BẢNG XẾP HẠNG",
        'fr': "SCORE ÉLEVÉ",
        'es': "PUNTUACIÓN MÁS ALTA",
        'pt': "PONTUAÇÃO MÁXIMA"
    },
	txt_complete: {
		'en': "You have completed all levels. Your score is: ",
		'vi': "Bạn đã hoàn thành tất cả cấp độ. Số điểm của bạn là: ",
		'fr': "Vous avez terminé tous les niveaux. Votre score est: ",
		'es': "Ha completado todos los niveles. Su puntuación es: ",
		'pt': "Ter concluído todos os níveis. Sua pontuação é: "
	},
	txt_nochange: {
		'en': "No more changes.",
		'vi': "Hết lượt đổi.",
		'fr': "Plus de changements.",
		'es': "No más cambios.",
		'pt': "Sem mais mudanças."
	},
	txt_nopair: {
		'en': "No more pairs to remove.",
		'vi': "Không còn cặp nào để loại bỏ.",
		'fr': "Plus de paires à enlever.",
		'es': "No hay más pares que eliminar.",
		'pt': "Não mais pares a remover."
	},
	txt_gameover: {
		'en': "Game over!",
		'vi': "Thua cuộc!",
		'fr': "Jeu terminé!",
		'es': "¡Juego terminado!",
		'pt': "Fim de jogo!"
	},
    txt_levelcompleted: {
        'en': "Level completed!",
        'vi': "Hoàn thành!",
        'fr': "Niveau terminé!",
        'es': "Nivel completado!",
        'pt': "Nível concluído!"
    },
    txt_yourrankis: {
        'en': "Your rank is ",
        'vi': "Thứ hạng của bạn là ",
        'fr': "Votre rang est ",
        'es': "Tu rango es ",
        'pt': "Seu Rank é "
    },
    txt_playagain: {
        'en': "Please re-play to get higher rankings.",
        'vi': "Thứ hạng của bạn là ",
        'fr': "Re-jouer pour obtenir des classements plus élevés.",
        'es': "Por favor, vuelva a jugar para obtener una clasificación más alta.",
        'pt': "Por favor, re-play para obter classificações mais elevadas."
    },
    txt_savescorefailed: {
        'en': "Cannot save the score at the moment. Please try again later.",
        'vi': "Có lỗi khi lưu điểm soos. Vui lòng thử lại sau.",
        'fr': "Impossible d'enregistrer le score en ce moment. Veuillez réessayer plus tard.",
        'es': "No se puede guardar la partitura en este momento. Por favor, inténtelo de nuevo más tarde.",
        'pt': "Não é possível salvar a partitura no momento. Por favor, tente novamente mais tarde."
    },
    txt_gethighscorefailed: {
        'en': "Cannot get the highscore at the moment. Please try again later.",
        'vi': "Có lỗi khi lấy dữ liệu bảng xếp hạng. Vui lòng thử lại sau.",
        'fr': "Je ne peux pas obtenir le meilleur score en ce moment. Veuillez réessayer plus tard.",
        'es': "No se puede obtener el highscore en este momento. Por favor, inténtelo de nuevo más tarde.",
        'pt': "Não é possível obter o highscore no momento. Por favor, tente novamente mais tarde."
    },
}

function getString(id, lang) {
	if (lang == null || langs.indexOf(lang) == -1) lang = 'en';
	return strings[id][lang];
}