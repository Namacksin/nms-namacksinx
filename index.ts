import { events } from "bdsx/event";

console.log(`
    ███╗   ██╗ █████╗ ███╗   ███╗ █████╗  ██████╗██╗  ██╗███████╗██╗███╗   ██╗██╗  ██╗
    ████╗  ██║██╔══██╗████╗ ████║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██║████╗  ██║╚██╗██╔╝
    ██╔██╗ ██║███████║██╔████╔██║███████║██║     █████╔╝ ███████╗██║██╔██╗ ██║ ╚███╔╝ 
    ██║╚██╗██║██╔══██║██║╚██╔╝██║██╔══██║██║     ██╔═██╗ ╚════██║██║██║╚██╗██║ ██╔██╗ 
    ██║ ╚████║██║  ██║██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██╗███████║██║██║ ╚████║██╔╝ ██╗
    ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝                                                                              
`.blue);
console.log("namacksinX is loading...".blue);

events.serverOpen.on(() => {
    console.log('namacksinX is launched!'.blue);
    import("./main");
});