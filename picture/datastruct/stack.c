
#define STACK_SIZE 100
static int stack[STACK_SIZE];
static int pos = 0;

void push(int i){
	stack[pos] = i;
	pos++;
}

int pop(){
	pos--;
	return stack[pos + 1];
}










