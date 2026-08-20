import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc6l3nVqTq_rc6gfGgAdV0EfAQANyeDxk",
  authDomain: "active-maths-championship.firebaseapp.com",
  projectId: "active-maths-championship",
  storageBucket: "active-maths-championship.firebasestorage.app",
  messagingSenderId: "477055306131",
  appId: "1:477055306131:web:a013077e226defc6300066",
  measurementId: "G-2DX3TEDZP1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export { signInWithPopup, onAuthStateChanged, signOut };

// Cada toma funciona como una competencia independiente. La 1.ª toma 2026
// conserva exactamente el modelo de documentos original; las tomas nuevas se
// guardan en colecciones separadas por competencia para no mezclar datos ni
// exponer ejercicios de instancias futuras.
export const LEGACY_COMPETITION_ID = "amc-2026-toma-1";

export const DEFAULT_COMPETITIONS = [
    {
        id: LEGACY_COMPETITION_ID,
        name: "1.ª toma 2026",
        fullName: "Active Maths Championship · 1.ª toma 2026",
        year: 2026,
        take: 1,
        status: "closed",
        legacy: true,
        restrictedToClassified: false,
        qualifierCompetitionId: null,
        profileSourceCompetitionId: null
    },
    {
        id: "amc-2026-toma-2",
        name: "2.ª toma 2026 · Final",
        fullName: "Active Maths Championship · 2.ª toma 2026 · Final",
        year: 2026,
        take: 2,
        status: "draft",
        legacy: false,
        restrictedToClassified: true,
        qualifierCompetitionId: LEGACY_COMPETITION_ID,
        profileSourceCompetitionId: LEGACY_COMPETITION_ID
    },
    {
        id: "amc-2027-toma-1",
        name: "1.ª toma 2027",
        fullName: "Active Maths Championship · 1.ª toma 2027",
        year: 2027,
        take: 1,
        status: "draft",
        legacy: false,
        restrictedToClassified: false,
        qualifierCompetitionId: null,
        profileSourceCompetitionId: null
    },
    {
        id: "amc-2027-toma-2",
        name: "2.ª toma 2027 · Final",
        fullName: "Active Maths Championship · 2.ª toma 2027 · Final",
        year: 2027,
        take: 2,
        status: "draft",
        legacy: false,
        restrictedToClassified: true,
        qualifierCompetitionId: "amc-2027-toma-1",
        profileSourceCompetitionId: "amc-2027-toma-1"
    }
];

export function normalizeCompetitionRegistry(data = {}) {
    const stored = Array.isArray(data.competitions) ? data.competitions : [];
    const storedById = new Map(stored.filter(c => c?.id).map(c => [c.id, c]));
    const defaultIds = new Set(DEFAULT_COMPETITIONS.map(c => c.id));
    const competitions = DEFAULT_COMPETITIONS.map(defaultCompetition => ({
        ...defaultCompetition,
        ...(storedById.get(defaultCompetition.id) || {})
    }));
    stored.forEach(competition => {
        if (competition?.id && !defaultIds.has(competition.id)) competitions.push(competition);
    });
    const requestedActiveId = data.activeCompetitionId || LEGACY_COMPETITION_ID;
    const activeCompetitionId = competitions.some(c => c.id === requestedActiveId)
        ? requestedActiveId
        : LEGACY_COMPETITION_ID;
    return { competitions, activeCompetitionId };
}

export function getCompetitionById(registry, competitionId) {
    return registry?.competitions?.find(c => c.id === competitionId) || null;
}

export const SCHOOLS = [
    "Ameghino", "Amundsen", "Biró", "Chesterton", "Dickens",
    "Gaudi", "Ikastola", "Marie Curie", "Molisano",
    "Nuestra Señora del Carmen", "Nuestra Señora del Huerto",
    "Shackleton", "Stevenson", "Tesla", "Tolkien"
];

export const CATEGORIES = [
    { id: "basico",     name: "Básico (7N y 8N)" },
    { id: "intermedio", name: "Intermedio (9N y 10N)" },
    { id: "avanzado",   name: "Avanzado (11N y 12N)" },
    { id: "pitagoras",  name: "Pitágoras" }
];

// Mapea una categoría derivada a la categoría base que comparte su banco de
// preguntas en Firestore. Las 4 categorías actuales (basico/intermedio/
// avanzado/pitagoras) tienen banco propio, así que este mapa queda vacío.
export const CATEGORY_BASE_MAP = {};

// Mapea IDs de categoría obsoletos al ID actual (retrocompatibilidad con
// usuarios que se registraron antes del rediseño de categorías).
export const LEGACY_CATEGORY_MAP = {
    "basico_a":     "basico",
    "basico_b":     "basico",
    "intermedio_a": "intermedio",
    "avanzado_a":   "avanzado",
    "sol":          "pitagoras"
};

export const QUESTIONS_DB = {
    "basico": [
        {
            id: "b1",
            text: "Problema 1: El rectángulo de la figura está dividido en cuatro rectángulos más pequeños mediante dos líneas paralelas a sus lados. En tres de ellos se ha escrito el perímetro correspondiente (1, 2, 2). ¿Cuál es el perímetro del cuarto rectángulo?",
            correctAnswer: "3"
        },
        {
            id: "b2",
            text: "Problema 3: Reemplazando x e y por dígitos, hallar todos los números naturales de cinco cifras 65x1y que son múltiplos de doce.",
            correctAnswer: "65016, 65316, 65616, 65916"
        },
        {
            id: "b3",
            text: "Problema 8: Hallar todos los números de cuatro cifras 1a7b que son múltiplos de 15. (a y b son dígitos no necesariamente distintos.)",
            correctAnswer: "1070, 1370, 1670, 1970"
        },
        {
            id: "b4",
            text: "Problema 10: Al sumar el número de cuatro dígitos ABCD más el número de tres dígitos BCD más el número de dos dígitos CD más el número de un dígito D el resultado es 2000. Hallar los dígitos A, B, C y D, si cada letra representa un dígito distinto.",
            correctAnswer: "A=1, B=9, C=8, D=5"
        }
    ],
    "intermedio": [
        {
            id: "i1",
            text: "Problema 1: El promedio de 16 números es igual a 168. Se modifican los números: a los primeros 8 se les resta 3 y a los últimos 8 se les suma 10. Determinar el promedio de los 16 números obtenidos.",
            correctAnswer: "171.5"
        },
        {
            id: "i2",
            text: "Problema 3: Determinar cuántos números enteros entre 1 y 2026 inclusive no contienen el dígito 1.",
            correctAnswer: "1480"
        },
        {
            id: "i3",
            text: "Problema 5: Ariel dibujó un triángulo. Bruno dibujó otro triángulo cuya base es 10% mayor y altura 10% menor. Determinar a qué porcentaje del área del triángulo de Ariel es igual el área del triángulo de Bruno.",
            correctAnswer: "99%"
        },
        {
            id: "i4",
            text: "Problema 8: Hallar todos los tríos (p, q, r) de números primos, con q menor que r, que satisfacen p × (q + r) = 215. Considerar p, q, r positivos.",
            correctAnswer: "(5, 2, 41)"
        }
    ],
    "avanzado": [
        {
            id: "a1",
            text: "Problema 1: Sea N = 36^x − 5^y, con x e y enteros positivos. Entre todos los valores positivos de N, determinar el menor posible.",
            correctAnswer: "11"
        },
        {
            id: "a2",
            text: "Problema 2: En el triángulo ABC rectángulo en A, la perpendicular a BC trazada desde A corta a BC en D de modo que BD = 3 y CD = 12. Calcular el área del triángulo ABC.",
            correctAnswer: "45"
        },
        {
            id: "a3",
            text: "Problema 8: Hallar la cantidad de enteros n tales que: 2000 < n < 7000, n es múltiplo de 2 y los dígitos de n son todos diferentes.",
            correctAnswer: "1400"
        },
        {
            id: "a4",
            text: "Problema 10: Escribir en cada casilla uno de los números 35; 40; 44; 46; 55 sin repetir, para que el promedio de los dos primeros sea entero, el de los tres primeros sea entero y el de los cuatro primeros sea entero.",
            correctAnswer: "55, 35, 46, 44, 40"
        }
    ]
};

QUESTIONS_DB["pitagoras"] = [];

export const DB = {
    getCompetitionRegistry: async () => {
        try {
            const snap = await getDoc(doc(db, "config", "settings"));
            return normalizeCompetitionRegistry(snap.exists() ? snap.data() : {});
        } catch (_) {
            return normalizeCompetitionRegistry();
        }
    },
    saveCompetitionRegistry: async (registry) => {
        const normalized = normalizeCompetitionRegistry(registry);
        const competitionStatuses = Object.fromEntries(
            normalized.competitions.map(competition => [competition.id, competition.status])
        );
        await setDoc(doc(db, "config", "settings"), {
            competitions: normalized.competitions,
            competitionStatuses,
            activeCompetitionId: normalized.activeCompetitionId,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return normalized;
    },
    saveUser: async (uid, userData, competitionId = LEGACY_COMPETITION_ID) => {
        if (competitionId === LEGACY_COMPETITION_ID) {
            await setDoc(doc(db, "users", uid), userData, { merge: true });
            return;
        }
        await setDoc(doc(db, "competition_users", competitionId, "users", uid), userData, { merge: true });
    },
    getUser: async (uid, competitionId = LEGACY_COMPETITION_ID, profileSourceCompetitionId = null) => {
        const legacySnap = await getDoc(doc(db, "users", uid));
        const data = legacySnap.exists() ? legacySnap.data() : {};
        const legacyProfile = () => {
            if (!data.firstName && !data.lastName && !data.name && !data.email && !data.school && !data.category) return null;
            const { competitionProfiles, ...profile } = data;
            return profile;
        };
        if (competitionId === LEGACY_COMPETITION_ID) return legacyProfile();
        const ownSnap = await getDoc(doc(db, "competition_users", competitionId, "users", uid));
        if (ownSnap.exists()) return ownSnap.data();
        if (!profileSourceCompetitionId) return null;
        if (profileSourceCompetitionId === LEGACY_COMPETITION_ID) return legacyProfile();
        const sourceSnap = await getDoc(doc(db, "competition_users", profileSourceCompetitionId, "users", uid));
        return sourceSnap.exists() ? sourceSnap.data() : null;
    },
    saveExamState: async (uid, state, competitionId = LEGACY_COMPETITION_ID) => {
        if (competitionId === LEGACY_COMPETITION_ID) {
            await setDoc(doc(db, "exam_states", uid), state, { merge: true });
            return;
        }
        await setDoc(doc(db, "competition_exam_states", competitionId, "states", uid), state, { merge: true });
    },
    getExamState: async (uid, competitionId = LEGACY_COMPETITION_ID) => {
        const stateRef = competitionId === LEGACY_COMPETITION_ID
            ? doc(db, "exam_states", uid)
            : doc(db, "competition_exam_states", competitionId, "states", uid);
        const snap = await getDoc(stateRef);
        if (!snap.exists()) return null;
        const data = snap.data();
        if (competitionId !== LEGACY_COMPETITION_ID) return data;
        if (!data.startTime && !data.endTime && !data.finished && !data.answers) return null;
        return data;
    },
    saveSubmission: async (uid, submission, competitionId = LEGACY_COMPETITION_ID) => {
        if (competitionId === LEGACY_COMPETITION_ID) {
            await setDoc(doc(db, "submissions", uid), submission, { merge: true });
            await setDoc(doc(db, "exam_states", uid), { finished: true }, { merge: true });
            return;
        }
        const batch = writeBatch(db);
        batch.set(doc(db, "competition_submissions", competitionId, "entries", uid), submission);
        batch.set(doc(db, "competition_exam_states", competitionId, "states", uid), { finished: true }, { merge: true });
        await batch.commit();
    },
    updateSubmission: async (uid, data, competitionId = LEGACY_COMPETITION_ID) => {
        if (competitionId === LEGACY_COMPETITION_ID) {
            await setDoc(doc(db, "submissions", uid), data, { merge: true });
            return;
        }
        await setDoc(doc(db, "competition_submissions", competitionId, "entries", uid), data, { merge: true });
    },
    getSubmissions: async (competitionId = LEGACY_COMPETITION_ID) => {
        if (competitionId !== LEGACY_COMPETITION_ID) {
            const [submissionSnap, classificationSnap] = await Promise.all([
                getDocs(collection(db, "competition_submissions", competitionId, "entries")),
                getDocs(collection(db, "competition_classifications", competitionId, "entries"))
            ]);
            const classifications = new Map();
            classificationSnap.forEach(d => classifications.set(d.id, d.data()));
            const scoped = [];
            submissionSnap.forEach(d => scoped.push({
                _docId: d.id,
                ...d.data(),
                ...(classifications.get(d.id) || {}),
                competitionId
            }));
            return scoped;
        }
        const snap = await getDocs(collection(db, "submissions"));
        const subs = [];
        snap.forEach(d => {
            const data = d.data();
            if (!data.submittedAt && !data.answers) return;
            subs.push({ _docId: d.id, ...data, competitionId });
        });
        return subs;
    },
    setClassified: async (uid, classified, competitionId = LEGACY_COMPETITION_ID) => {
        const classification = {
            classified: Boolean(classified),
            classifiedAt: classified ? new Date().toISOString() : null
        };
        if (competitionId === LEGACY_COMPETITION_ID) {
            await setDoc(doc(db, "submissions", uid), classification, { merge: true });
            return;
        }
        await setDoc(doc(db, "competition_classifications", competitionId, "entries", uid), classification, { merge: true });
    },
    isEligible: async (uid, competition) => {
        if (!competition?.restrictedToClassified) return true;
        const qualifierId = competition.qualifierCompetitionId;
        if (!qualifierId) return false;
        if (qualifierId === LEGACY_COMPETITION_ID) {
            const snap = await getDoc(doc(db, "submissions", uid));
            return snap.exists() && snap.data().classified === true;
        }
        const snap = await getDoc(doc(db, "competition_classifications", qualifierId, "entries", uid));
        return snap.exists() && snap.data().classified === true;
    },
    // Para el examen del estudiante: solo enunciado, NUNCA la respuesta correcta.
    // La clave de respuestas vive en una colección separada (answer_keys) que las
    // reglas de Firestore solo dejan leer al admin, así un estudiante no puede
    // verla por la consola del navegador ni por la pestaña Network.
    getQuestions: async (category, competitionId = LEGACY_COMPETITION_ID) => {
        const cat = LEGACY_CATEGORY_MAP[category] || category;
        const baseCategory = CATEGORY_BASE_MAP[cat] || cat;
        try {
            const questionRef = competitionId === LEGACY_COMPETITION_ID
                ? doc(db, "questions", baseCategory)
                : doc(db, "competition_questions", competitionId, "categories", baseCategory);
            const snap = await getDoc(questionRef);
            if (snap.exists()) {
                const data = snap.data();
                if (competitionId !== LEGACY_COMPETITION_ID) return data.questions || [];
                if (data.questions?.length > 0) return data.questions;
            }
        } catch (_) { /* network error or permission denied: use defaults */ }
        if (competitionId !== LEGACY_COMPETITION_ID) return [];
        return (QUESTIONS_DB[cat] || []).map(({ id, text, imageUrl }) => ({ id, text, imageUrl }));
    },
    // Solo para el admin: enunciado + respuesta correcta combinados, para editar y corregir.
    getQuestionsFull: async (category, competitionId = LEGACY_COMPETITION_ID) => {
        const cat = LEGACY_CATEGORY_MAP[category] || category;
        const baseCategory = CATEGORY_BASE_MAP[cat] || cat;
        let qs = null, answers = null;
        try {
            const questionRef = competitionId === LEGACY_COMPETITION_ID
                ? doc(db, "questions", baseCategory)
                : doc(db, "competition_questions", competitionId, "categories", baseCategory);
            const qSnap = await getDoc(questionRef);
            if (qSnap.exists()) {
                const data = qSnap.data();
                qs = competitionId === LEGACY_COMPETITION_ID
                    ? (data.questions?.length > 0 ? data.questions : null)
                    : (data.questions || []);
            }
        } catch (_) { /* usar default */ }
        try {
            const answerRef = competitionId === LEGACY_COMPETITION_ID
                ? doc(db, "answer_keys", baseCategory)
                : doc(db, "competition_answer_keys", competitionId, "categories", baseCategory);
            const aSnap = await getDoc(answerRef);
            if (aSnap.exists()) {
                const data = aSnap.data();
                answers = competitionId === LEGACY_COMPETITION_ID
                    ? (data.answers || {})
                    : (data.answers || {});
            }
        } catch (_) { /* usar default */ }

        const fallback = QUESTIONS_DB[cat] || [];
        if (competitionId === LEGACY_COMPETITION_ID) {
            if (!qs) qs = fallback.map(({ id, text, imageUrl }) => ({ id, text, imageUrl }));
            if (!answers) answers = Object.fromEntries(fallback.map(q => [q.id, q.correctAnswer]));
        } else {
            if (!qs) qs = [];
            if (!answers) answers = {};
        }

        return qs.map(q => ({ ...q, correctAnswer: answers[q.id] ?? '' }));
    },
    // Solo para el admin: separa enunciado y respuesta antes de guardar en las dos colecciones.
    saveQuestionsFull: async (category, questions, competitionId = LEGACY_COMPETITION_ID) => {
        const cat = LEGACY_CATEGORY_MAP[category] || category;
        const baseCategory = CATEGORY_BASE_MAP[cat] || cat;
        const qs      = questions.map(({ id, text, imageUrl }) => ({ id, text, ...(imageUrl ? { imageUrl } : {}) }));
        const answers = {};
        questions.forEach(q => { answers[q.id] = q.correctAnswer; });
        const updatedAt = new Date().toISOString();
        if (competitionId === LEGACY_COMPETITION_ID) {
            await setDoc(doc(db, "questions", baseCategory), { questions: qs, updatedAt }, { merge: true });
            await setDoc(doc(db, "answer_keys", baseCategory), { answers, updatedAt }, { merge: true });
            return;
        }
        await setDoc(doc(db, "competition_questions", competitionId, "categories", baseCategory), { questions: qs, updatedAt });
        await setDoc(doc(db, "competition_answer_keys", competitionId, "categories", baseCategory), { answers, updatedAt });
    },
    deleteSubmission: async (uid, competitionId = LEGACY_COMPETITION_ID) => {
        if (competitionId !== LEGACY_COMPETITION_ID) {
            await deleteDoc(doc(db, "competition_submissions", competitionId, "entries", uid));
            await deleteDoc(doc(db, "competition_exam_states", competitionId, "states", uid));
            await deleteDoc(doc(db, "competition_classifications", competitionId, "entries", uid));
            return;
        }
        await deleteDoc(doc(db, "submissions", uid));
        await deleteDoc(doc(db, "exam_states", uid));
    },
    getConfig: async (competitionId = LEGACY_COMPETITION_ID) => {
        try {
            const snap = await getDoc(doc(db, "config", "settings"));
            if (!snap.exists()) return { examDurationMinutes: 80 };
            const data = snap.data();
            if (competitionId === LEGACY_COMPETITION_ID) {
                return data.competitionConfigs?.[competitionId] || {
                    examDurationMinutes: data.examDurationMinutes || 80
                };
            }
            return data.competitionConfigs?.[competitionId] || { examDurationMinutes: 80 };
        } catch (_) {
            return { examDurationMinutes: 80 };
        }
    },
    saveConfig: async (config, competitionId = LEGACY_COMPETITION_ID) => {
        const payload = {
            competitionConfigs: { [competitionId]: config },
            updatedAt: new Date().toISOString()
        };
        if (competitionId === LEGACY_COMPETITION_ID) {
            payload.examDurationMinutes = config.examDurationMinutes;
        }
        await setDoc(doc(db, "config", "settings"), payload, { merge: true });
    }
};
